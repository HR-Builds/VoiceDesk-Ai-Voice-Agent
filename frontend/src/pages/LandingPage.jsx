import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Mic, Headphones, Shield, Zap, BarChart3, Globe, ArrowRight, Phone, Sparkles, Star, Waves } from 'lucide-react'
import AuroraBackground from '../components/AuroraBackground'

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className={className}>
      {children}
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`float-luxury group relative overflow-hidden rounded-2xl p-8 transition-all duration-700 hover:scale-[1.02] ${index === 1 || index === 4 ? 'md:translate-y-6' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-[80px] transition-opacity duration-700 group-hover:opacity-100 opacity-60" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-violet-500/10 blur-[60px]" />
      
      <div className="relative">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c1f1c] to-[#1a1033] text-teal-400 ring-1 ring-teal-500/20 shadow-lg shadow-teal-900/20">
          <Icon size={26} strokeWidth={1.5} />
        </div>
        <h3 className="mb-3 font-display text-xl font-semibold text-white tracking-wide">{title}</h3>
        <p className="leading-relaxed text-gray-500 text-sm">{description}</p>
      </div>
      
      <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-teal-400 via-violet-400 to-rose-400 transition-all duration-700 group-hover:w-full" />
    </motion.div>
  )
}

function WaveformLuxury() {
  return (
    <div className="flex items-center gap-[2px]">
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-teal-400 to-white"
          animate={{ height: [6, 24 + Math.sin(i) * 12, 6] }}
          transition={{ duration: 0.6 + i * 0.08, repeat: Infinity, delay: i * 0.05, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function RotatingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="spin-slow absolute h-[160%] w-[160%] rounded-full border border-dashed border-teal-500/10" />
      <div className="spin-slower absolute h-[200%] w-[200%] rounded-full border border-dotted border-violet-500/8" />
      <div className="spin-slowest absolute h-[240%] w-[240%] rounded-full border border-rose-500/5" />
    </div>
  )
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92])

  const [isListening, setIsListening] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#06040a] font-body selection:bg-teal-500/30 selection:text-teal-100 overflow-hidden">
      <AuroraBackground />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.03] bg-[#06040a]/30 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20">
              <Waves size={20} className="text-white" />
              <div className="absolute inset-0 rounded-xl bg-teal-400/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              VoiceDesk <span className="text-teal-400">AI</span>
            </span>
          </div>
          <div className="hidden items-center gap-10 md:flex">
            {['Features', 'Pipeline', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="relative text-sm font-medium text-gray-500 transition-colors hover:text-white group">
                {item}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-teal-400 to-violet-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="hidden text-sm font-medium text-gray-500 transition-colors hover:text-white md:block">Sign In</a>
            <a href="/login" className="relative overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-xl hover:shadow-teal-500/20">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center pt-24 pb-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-teal-500/20 bg-teal-950/20 px-5 py-2 text-sm text-teal-300 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-orange-400" />
            <span>Enterprise Voice AI — Now Available</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" style={{ animationDuration: '2s' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mb-8 font-display text-6xl font-bold leading-[1.05] tracking-tight text-white md:text-8xl lg:text-[9rem]"
          >
            The Future of
            <br />
            <span className="shimmer-jewel">Support.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl"
          >
            An AI voice agent that speaks, listens, and resolves — pulling from your knowledge base and live order data in real time. No scripts. No queues. Just conversations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href="/login" className="group relative inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:shadow-2xl hover:shadow-white/10 overflow-hidden">
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="/voice" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-medium text-gray-500 backdrop-blur-md transition-all hover:border-teal-500/30 hover:bg-white/[0.06] hover:text-white">
  <Headphones size={18} />
  Hear a Demo
</a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 flex items-center justify-center gap-8 opacity-30"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <Star size={12} className="text-orange-500" />
                <span className="text-xs font-medium uppercase tracking-widest">Partner {i}</span>
              </div>
            ))}
          </motion.div>

          {/* Interactive Voice Widget */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.3 }}
            className="mx-auto mt-28 max-w-lg"
          >
            <div className="relative overflow-hidden rounded-3xl p-8 shadow-2xl shadow-black/60" style={{ background: 'rgba(6, 4, 10, 0.6)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/20 blur-[80px]" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-violet-500/20 blur-[60px]" />
              
              <div className="mb-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 ring-1 ring-teal-500/20">
                    <div className={`h-2.5 w-2.5 rounded-full ${isListening ? 'animate-pulse bg-teal-400' : 'bg-emerald-400'}`} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-gray-600">VoiceDesk Agent</span>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 ring-1 ring-white/5">
                  {isListening ? 'Listening' : 'Online'}
                </span>
              </div>

              <div className="mb-8 flex flex-col items-center gap-5 relative z-10">
                <button
                  onClick={() => setIsListening(!isListening)}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-teal-500 to-teal-700 shadow-2xl shadow-teal-500/30 transition-all duration-500 hover:scale-105 active:scale-95"
                  style={{ animation: isListening ? 'breathe 2s ease-in-out infinite' : 'none' }}
                >
                  {isListening ? <WaveformLuxury /> : <Mic size={32} className="text-white/90" />}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full border border-teal-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                      <span className="absolute -inset-4 rounded-full border border-teal-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                      <span className="absolute -inset-8 rounded-full border border-teal-500/5 animate-ping" style={{ animationDuration: '2.5s' }} />
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 tracking-wide">
                  {isListening ? 'Speak now, I am listening...' : 'Tap the microphone to begin'}
                </p>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05]">
                  <p className="text-sm text-gray-400">"Where is my order #4829?"</p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-teal-950/40 to-transparent p-4 ring-1 ring-teal-500/10">
                  <p className="text-sm text-teal-200/80">"Your order #4829 was shipped yesterday via FedEx. Expected delivery: tomorrow by 6 PM."</p>
                </div>
              </div>

              <RotatingRings />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Marquee */}
      <div className="relative z-10 border-y border-white/[0.03] bg-white/[0.01] py-5 backdrop-blur-sm overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIndex) => (
            <span key={setIndex} className="inline-flex items-center gap-12 px-6">
              {['Voice Synthesis', 'Real-time RAG', 'Order Lookup', 'Multi-tenant', 'Whisper STT', 'GPT-4o-mini', 'Analytics', 'WebSocket', 'Turquoise Aurora', 'Jewel Tones'].map((text, i) => (
                <span key={i} className="inline-flex items-center gap-3 text-base font-medium text-gray-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500/40" />
                  {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-36">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-28 text-center">
            <motion.p variants={fadeInUp} className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-teal-400">
              Capabilities
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mb-6 font-display text-5xl font-bold text-white md:text-7xl leading-tight">
              Built for scale.<br />
              <span className="text-gray-700">Designed for trust.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto max-w-xl text-lg text-gray-600 leading-relaxed">
              Every feature engineered to make your customers feel heard — and your team feel empowered.
            </motion.p>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Mic, title: 'Natural Voice AI', desc: 'Whisper-powered recognition with human-like TTS. Your customers will never know it is a bot.' },
              { icon: Globe, title: 'Multi-Tenant', desc: 'Isolated workspaces per company. Enterprise security from the very first line of code.' },
              { icon: Zap, title: 'Live Order Lookup', desc: 'Connect your database. Let customers ask "Where is my order?" in any language.' },
              { icon: Sparkles, title: 'Knowledge Base RAG', desc: 'Upload PDFs and FAQs. Our vector pipeline retrieves the exact answer, every time.' },
              { icon: BarChart3, title: 'Analytics Suite', desc: 'Resolution rates, call durations, top questions — all visualized in real time.' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Admins manage. Agents assist. Auditors review. Full control, zero compromise.' },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="pipeline" className="relative z-10 border-y border-white/[0.03] bg-white/[0.005] py-36 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-teal-500/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-28 text-center">
            <motion.p variants={fadeInUp} className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-teal-400">
              The Pipeline
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-5xl font-bold text-white md:text-7xl leading-tight">
              Four steps to<br />
              <span className="text-gray-700">effortless support.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid gap-16 md:grid-cols-4">
            {[
              { step: '01', title: 'Upload', desc: 'Add your FAQs, policies, and order data to your isolated company workspace.', color: 'from-teal-500 to-teal-700' },
              { step: '02', title: 'Connect', desc: 'Customers call or chat. Our WebSocket pipeline captures voice in real time.', color: 'from-orange-500 to-orange-700' },
              { step: '03', title: 'Think', desc: 'Whisper transcribes. RAG retrieves context. GPT reasons. TTS speaks back.', color: 'from-rose-500 to-rose-700' },
              { step: '04', title: 'Learn', desc: 'Every conversation is logged. Analytics reveal what your customers ask most.', color: 'from-violet-500 to-violet-700' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative group text-center">
                <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color} shadow-2xl transition-transform duration-500 group-hover:scale-110`}>
                  <span className="font-display text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-white tracking-wide">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                <div className="mx-auto mt-6 h-px w-0 bg-gradient-to-r from-transparent via-teal-400 to-transparent group-hover:w-24 transition-all duration-700" />
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '24/7', label: 'Availability' },
              { value: '<2s', label: 'Response Time' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '50+', label: 'Languages' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center group"
              >
                <div className="mb-2 font-display text-4xl font-bold text-white md:text-5xl group-hover:text-teal-400 transition-colors duration-500">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest text-gray-700">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 overflow-hidden py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-900/[0.03] to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-[150px] breathe-glow" />
        
        <AnimatedSection className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div variants={fadeInUp} className="mb-10 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-2xl shadow-teal-500/20">
            <Phone size={32} className="text-white" />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="mb-8 font-display text-5xl font-bold text-white md:text-7xl leading-tight">
            Ready to replace<br />
            <span className="shimmer-jewel">your hold music?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="mb-14 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Join the companies using VoiceDesk AI to answer customers around the clock — in any language, on any channel.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <a href="/login" className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-10 py-5 text-lg font-semibold text-black shadow-2xl shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:scale-105 overflow-hidden">
              <span className="relative z-10">Start Your Free Trial</span>
              <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.03] bg-[#06040a] py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
              <Waves size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              VoiceDesk <span className="text-teal-400">AI</span>
            </span>
          </div>
          <p className="text-sm text-gray-800">© 2026 VoiceDesk AI. All rights reserved.</p>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-800 hover:text-teal-400 transition-colors duration-300">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}