import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Users, Phone, MessageSquare, Trash2, UserX, Plus, Upload, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (t) => setSearchParams({ tab: t });

  const [agents, setAgents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAgent, setNewAgent] = useState({ email: '', password: '', full_name: '' });
  const [newDoc, setNewDoc] = useState({ filename: '', content: '' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      if (activeTab === 'dashboard' || activeTab === 'conversations') setConversations(await api('/conversations/'));
      if (activeTab === 'dashboard' || activeTab === 'agents') setAgents(await api('/users/agents'));
      if (activeTab === 'dashboard' || activeTab === 'documents') setDocuments(await api('/documents/'));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try { await api('/users/agents', { method: 'POST', body: newAgent }); setNewAgent({ email: '', password: '', full_name: '' }); fetchData(); }
    catch (e) { setError(e.message); }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    try { await api('/documents/', { method: 'POST', body: newDoc }); setNewDoc({ filename: '', content: '' }); fetchData(); }
    catch (e) { setError(e.message); }
  };

  const escalated = conversations.filter(c => c.escalation).length;
  const resolved = conversations.filter(c => c.resolved).length;
  const inputCls = "w-full rounded-xl bg-white/[0.03] px-4 py-3 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-teal-500/50 placeholder-gray-700";
  const card = (label, value, icon, color) => (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{value}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 font-display text-xl font-bold capitalize sm:text-2xl">{activeTab}</h1>
      <p className="mb-6 text-sm text-gray-600">Manage your VoiceDesk AI workspace</p>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 ring-1 ring-rose-500/20">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {card('Conversations', conversations.length, <MessageSquare size={18} />, 'text-teal-400')}
            {card('Escalated', escalated, <AlertCircle size={18} />, 'text-rose-400')}
            {card('Resolved', resolved, <TrendingUp size={18} />, 'text-emerald-400')}
            {card('Docs', documents.length, <FileText size={18} />, 'text-violet-400')}
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="mb-4 font-semibold">Recent Conversations</h3>
            {loading ? <p className="text-sm text-gray-600">Loading...</p> :
             conversations.slice(0, 5).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.03] py-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.customer_phone || 'Web visitor'}</p>
                  <p className="text-xs text-gray-600">{c.session_id?.slice(0, 13)}...</p>
                </div>
                <div className="flex gap-2">
                  {c.escalation && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] text-rose-400 ring-1 ring-rose-500/20">Escalated</span>}
                  {c.resolved && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-400 ring-1 ring-emerald-500/20">Resolved</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h3 className="mb-4 flex items-center gap-2 font-semibold"><Plus size={16} className="text-teal-400" /> Add Agent</h3>
            <form onSubmit={handleCreateAgent} className="space-y-3">
              <input required placeholder="Full Name" value={newAgent.full_name} onChange={(e) => setNewAgent({ ...newAgent, full_name: e.target.value })} className={inputCls} />
              <input required type="email" placeholder="Email" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} className={inputCls} />
              <input required type="password" placeholder="Password" value={newAgent.password} onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })} className={inputCls} />
              <button className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-semibold text-black">Create Agent</button>
            </form>
          </div>
          <div className="rounded-2xl lg:col-span-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="border-b border-white/[0.04] p-6"><h3 className="flex items-center gap-2 font-semibold"><Users size={16} className="text-teal-400" /> All Agents</h3></div>
            {loading ? <p className="p-6 text-sm text-gray-600">Loading...</p> :
             agents.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-white/[0.03] px-6 py-4 last:border-0">
                <div><p className="text-sm font-medium">{a.full_name}</p><p className="text-xs text-gray-600">{a.email}</p></div>
                <div className="flex gap-2">
                  <button onClick={async () => { await api(`/users/agents/${a.id}/disable`, { method: 'PATCH' }); fetchData(); }} className="rounded-lg bg-white/[0.03] p-2 text-gray-500 hover:text-orange-400"><UserX size={15} /></button>
                  <button onClick={async () => { await api(`/users/agents/${a.id}`, { method: 'DELETE' }); fetchData(); }} className="rounded-lg bg-white/[0.03] p-2 text-gray-500 hover:text-rose-400"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h3 className="mb-4 flex items-center gap-2 font-semibold"><Upload size={16} className="text-teal-400" /> Upload Document</h3>
            <form onSubmit={handleUploadDoc} className="space-y-3">
              <input required placeholder="Filename (return-policy.txt)" value={newDoc.filename} onChange={(e) => setNewDoc({ ...newDoc, filename: e.target.value })} className={inputCls} />
              <textarea required rows={9} placeholder="Paste document content..." value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} className={inputCls + ' resize-none'} />
              <button className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-semibold text-black">Upload to Knowledge Base</button>
            </form>
          </div>
          <div className="rounded-2xl lg:col-span-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="border-b border-white/[0.04] p-6"><h3 className="flex items-center gap-2 font-semibold"><FileText size={16} className="text-teal-400" /> Knowledge Base</h3></div>
            {loading ? <p className="p-6 text-sm text-gray-600">Loading...</p> :
             documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-white/[0.03] px-6 py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-teal-400" />
                  <div><p className="text-sm font-medium">{d.filename}</p><p className="text-xs text-gray-600">{new Date(d.created_at).toLocaleDateString()}</p></div>
                </div>
                <button onClick={async () => { await api(`/documents/${d.id}`, { method: 'DELETE' }); fetchData(); }} className="rounded-lg bg-white/[0.03] p-2 text-gray-500 hover:text-rose-400"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          {loading ? <p className="p-6 text-sm text-gray-600">Loading...</p> :
           conversations.map((c) => (
            <div key={c.id} className="border-b border-white/[0.03] px-4 py-4 last:border-0 sm:px-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-teal-400" />
                  <span className="text-sm font-medium">{c.customer_phone || 'Web visitor'}</span>
                  <span className="hidden text-xs text-gray-600 sm:inline">{c.session_id?.slice(0, 13)}...</span>
                </div>
                <div className="flex gap-2">
                  {c.escalation && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] text-rose-400 ring-1 ring-rose-500/20">Escalated</span>}
                  {c.resolved && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-400 ring-1 ring-emerald-500/20">Resolved</span>}
                </div>
              </div>
              {c.transcript?.slice(-3).map((m, i) => (
                <p key={i} className={`text-xs ${m.speaker === 'bot' ? 'text-teal-400/70' : 'text-gray-600'} ml-5 sm:ml-6`}>
                  <span className="font-medium">{m.speaker}:</span> {m.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}