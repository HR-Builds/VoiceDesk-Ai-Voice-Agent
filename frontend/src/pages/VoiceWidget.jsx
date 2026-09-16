import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, PhoneOff, Waves, Volume2, VolumeX, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function VoiceWidget() {
  const [companySlug, setCompanySlug] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [muted, setMuted] = useState(false);
  const [micOn, setMicOn] = useState(true);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const rafRef = useRef(null);
  const speakingRef = useRef(false);
  const silenceRef = useRef(0);
  const listeningRef = useRef(false);
  const discardRef = useRef(false);
  const botTalkingRef = useRef(false);
  const micOnRef = useRef(true);
  const statusRef = useRef('idle');

  const setStatusSafe = (s) => {
    if (statusRef.current !== s) { statusRef.current = s; setStatus(s); }
  };

  useEffect(() => { micOnRef.current = micOn; }, [micOn]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ---------- Browser TTS (multi-language) ----------
  const pauseRecording = () => {
    discardRef.current = true;
    speakingRef.current = false;
    silenceRef.current = 0;
    try { if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop(); } catch {}
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current || !listeningRef.current || botTalkingRef.current || !micOnRef.current) return;
    try {
      chunksRef.current = [];
      let rec;
      try { rec = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' }); }
      catch { rec = new MediaRecorder(streamRef.current); }
      recorderRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const shouldRestart = listeningRef.current && !botTalkingRef.current && micOnRef.current;
        if (discardRef.current) { discardRef.current = false; if (shouldRestart) startRecording(); return; }
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (shouldRestart) startRecording();
        if (blob.size < 1500) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'audio', data: base64 }));
            setStatusSafe('thinking');
          }
        };
        reader.readAsDataURL(blob);
      };
      rec.start();
    } catch {}
  }, []);

  const resumeRecording = useCallback(() => {
    if (listeningRef.current && micOnRef.current && !botTalkingRef.current) startRecording();
  }, [startRecording]);

  const speak = useCallback((text, lang = 'en') => {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.toLowerCase().startsWith((lang || 'en').toLowerCase()));
    if (match) u.voice = match;
    u.lang = match ? match.lang : (lang || 'en');
    u.rate = 1;
    u.onstart = () => { botTalkingRef.current = true; setStatusSafe('speaking'); pauseRecording(); };
    u.onend = () => { botTalkingRef.current = false; setStatusSafe('online'); resumeRecording(); };
    u.onerror = () => { botTalkingRef.current = false; setStatusSafe('online'); resumeRecording(); };
    window.speechSynthesis.speak(u);
  }, [muted, resumeRecording]);

  // ---------- VAD loop (silence detect + BARGE-IN) ----------
  const startVAD = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      listeningRef.current = true;
      startRecording();

      const loop = () => {
        if (!listeningRef.current) return;
        rafRef.current = requestAnimationFrame(loop);
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);

        // BARGE-IN: bot bol raha ho aur user zor se bole -> bot RUK jaye (phone call jaisa)
        if (botTalkingRef.current) {
          if (rms > 0.06) {
            window.speechSynthesis.cancel();
            botTalkingRef.current = false;
            setStatusSafe('listening');
            resumeRecording();
          }
          return;
        }
        if (!micOnRef.current) return;

        if (rms > 0.035) { speakingRef.current = true; silenceRef.current = 0; }
        else if (speakingRef.current) {
          silenceRef.current++;
          if (silenceRef.current > 60) {   // ~1 sec khamoshi -> auto send
            speakingRef.current = false;
            silenceRef.current = 0;
            try { if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop(); } catch {}
          }
        }
        if (statusRef.current !== 'thinking') {
          setStatusSafe(speakingRef.current ? 'listening' : 'online');
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setErrorMsg('Mic permission nahi mili. Browser mein mic allow karo, ya text mode use karo.');
      setStatusSafe('online');
    }
  };

  // ---------- WebSocket ----------
  const connect = () => {
    if (!companySlug.trim()) { setErrorMsg('Company slug daalo pehle'); return; }
    setErrorMsg('');
    setStatusSafe('connecting');
    const wsUrl = API.replace(/^http/, 'ws') + `/voice/ws/${companySlug}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setConnected(true);
      setMessages(prev => [...prev, { speaker: 'system', text: 'Connected! Ab bolo — main continuously sun raha hoon. Ruk ke jawab dunga.' }]);
      await startVAD();
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ready') {
        setMessages(prev => [...prev, { speaker: 'bot', text: data.message }]);
      } else if (data.type === 'response') {
        setMessages(prev => [...prev, { speaker: 'bot', text: data.text }]);
        speak(data.text, data.language || 'en');
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, { speaker: 'system', text: 'Error: ' + data.message }]);
        setStatusSafe('online');
      }
    };
    ws.onclose = () => { cleanup(); setConnected(false); setStatusSafe('idle'); };
    ws.onerror = () => setErrorMsg('Backend nahi mil raha. Backend chala ke retry karo.');
  };

  const cleanup = () => {
    listeningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    try { window.speechSynthesis?.cancel(); } catch {}
    botTalkingRef.current = false;
    try { if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    try { audioCtxRef.current?.close(); } catch {}
  };

  const disconnect = () => { cleanup(); wsRef.current?.close(); };

  const toggleMic = () => {
    micOnRef.current = !micOnRef.current;
    setMicOn(micOnRef.current);
    if (!micOnRef.current) pauseRecording(); else resumeRecording();
  };

  const sendText = () => {
    if (!inputText.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'text', data: inputText }));
    setMessages(prev => [...prev, { speaker: 'customer', text: inputText }]);
    setInputText('');
    setStatusSafe('thinking');
  };

  const statusColor = {
    idle: 'bg-gray-600', connecting: 'bg-yellow-400 animate-pulse',
    online: 'bg-emerald-400', listening: 'bg-teal-400 animate-pulse',
    thinking: 'bg-blue-400 animate-pulse', speaking: 'bg-violet-400 animate-pulse',
  }[status] || 'bg-gray-600';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#06040a] text-white">
      <div className="pointer-events-none fixed left-0 top-0 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[150px]" />

      {/* Header — mobile responsive */}
      <header className="z-10 border-b border-white/[0.04] bg-[#06040a]/60 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 sm:h-9 sm:w-9">
              <Waves size={17} className="text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold sm:text-xl">VoiceDesk <span className="text-teal-400">AI</span></span>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">{status}</span>
              </div>
            </div>
          </div>
          {connected && (
            <div className="flex items-center gap-2">
              <button onClick={() => setMuted(!muted)} className="rounded-lg bg-white/[0.03] p-2 text-gray-500 hover:text-white">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button onClick={toggleMic} className={`rounded-lg p-2 ${micOn ? 'bg-white/[0.03] text-teal-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button onClick={disconnect} className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/20">
                <PhoneOff size={14} /><span className="hidden sm:inline">End</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 ring-1 ring-rose-500/20">
              <AlertCircle size={18} /> {errorMsg}
              <button onClick={() => setErrorMsg('')} className="ml-auto">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
        {!connected ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/20" style={{ animationDuration: '3s' }} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-teal-500 to-teal-700 shadow-2xl shadow-teal-500/20">
                <Mic size={32} className="text-white" />
              </div>
            </div>
            <h2 className="mb-2 text-center font-display text-2xl font-bold sm:text-3xl">Real-Time Voice Chat</h2>
            <p className="mb-8 text-center text-sm text-gray-600">Connect karo — mic automatically on. Bas bolo, jawab khud aa jayega.</p>
            <div className="w-full max-w-sm space-y-3 px-2">
              <div className="flex gap-2 sm:gap-3">
                <input type="text" value={companySlug} onChange={(e) => setCompanySlug(e.target.value)}
                  placeholder="your-company-slug"
                  className="flex-1 rounded-xl bg-white/[0.03] px-4 py-3 text-sm ring-1 ring-white/10 placeholder:text-gray-700 focus:outline-none focus:ring-teal-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && connect()} />
                <button onClick={connect} disabled={status === 'connecting'}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
                  {status === 'connecting' ? '...' : 'Connect'}
                </button>
              </div>
              <p className="text-center text-xs text-gray-700">Backend <span className="text-teal-400">localhost:8000</span> pe chal raha hona chahiye</p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 sm:space-y-4 sm:pr-2">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.speaker === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:px-5 ${
                    msg.speaker === 'customer'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
                      : msg.speaker === 'system'
                      ? 'bg-white/[0.03] text-xs text-gray-500 ring-1 ring-white/[0.06]'
                      : 'bg-white/[0.03] text-teal-100 ring-1 ring-teal-500/10'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {status === 'thinking' && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/[0.03] px-5 py-3 ring-1 ring-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      <span className="ml-2 text-xs text-gray-500">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 rounded-2xl p-3 sm:p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              {(status === 'listening' || status === 'speaking') && (
                <div className="mb-3 flex h-8 items-center justify-center gap-1">
                  {[...Array(12)].map((_, i) => (
                    <motion.div key={i} className={`w-[3px] rounded-full ${status === 'listening' ? 'bg-teal-400' : 'bg-violet-400'}`}
                      animate={{ height: [8, 20 + Math.random() * 14, 8] }}
                      transition={{ duration: 0.4 + i * 0.05, repeat: Infinity, delay: i * 0.03 }} />
                  ))}
                  <span className={`ml-3 text-xs ${status === 'listening' ? 'text-teal-400' : 'text-violet-400'}`}>
                    {status === 'listening' ? 'Listening...' : 'AI speaking... (bolein to ruk jayega)'}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type here (text mode always works)..."
                  className="flex-1 bg-transparent text-sm placeholder:text-gray-700 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && sendText()} />
                <button onClick={sendText} disabled={!inputText.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-black disabled:opacity-30">
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-600">
                <span>{micOn ? '🎤 Auto-listening ON' : '🔇 Mic muted'}</span>
                <span>~1 sec khamoshi = auto-send</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}