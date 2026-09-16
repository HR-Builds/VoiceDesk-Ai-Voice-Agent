import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Waves, LayoutDashboard, FileText, Users, Phone, BarChart3, Settings, LogOut,
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Mic, MessageSquare
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

// Mock data — will wire to backend API later
const dailyData = [
  { date: 'Mon', conversations: 12 },
  { date: 'Tue', conversations: 19 },
  { date: 'Wed', conversations: 15 },
  { date: 'Thu', conversations: 25 },
  { date: 'Fri', conversations: 32 },
  { date: 'Sat', conversations: 28 },
  { date: 'Sun', conversations: 20 },
]

const recentConversations = [
  { id: 1, customer: '+1 (555) 0123', status: 'resolved', duration: '2m 14s', time: '2 min ago' },
  { id: 2, customer: '+1 (555) 0456', status: 'escalated', duration: '5m 32s', time: '15 min ago' },
  { id: 3, customer: '+1 (555) 0789', status: 'resolved', duration: '1m 45s', time: '32 min ago' },
  { id: 4, customer: '+1 (555) 0321', status: 'resolved', duration: '3m 08s', time: '1 hr ago' },
  { id: 5, customer: '+1 (555) 0654', status: 'resolved', duration: '2m 55s', time: '2 hr ago' },
]

const stats = [
  { label: 'Total Conversations', value: '1,284', change: '+12%', up: true, icon: MessageSquare, color: 'from-teal-500 to-teal-700' },
  { label: 'Resolution Rate', value: '94.2%', change: '+3.1%', up: true, icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
  { label: 'Avg Duration', value: '2m 18s', change: '-8%', up: false, icon: Clock, color: 'from-orange-500 to-orange-700' },
  { label: 'Escalations', value: '23', change: '-15%', up: true, icon: AlertCircle, color: 'from-rose-500 to-rose-700' },
]

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Documents' },
  { icon: Users, label: 'Agents' },
  { icon: Phone, label: 'Conversations' },
  { icon: Mic, label: 'Voice Chat', href: '/voice' },  // <-- ADD THIS
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="relative min-h-screen bg-[#06040a] text-white overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} border-r border-white/[0.04] bg-[#08060f]/80 backdrop-blur-xl`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/[0.04]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Waves size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold text-white">
              VoiceDesk <span className="text-teal-400">AI</span>
            </span>
          )}
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${item.active ? 'bg-white/[0.05] text-teal-400 ring-1 ring-white/[0.08]' : 'text-gray-500 hover:bg-white/[0.03] hover:text-white'}`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-white/[0.03] hover:text-white transition-all">
            <LogOut size={20} strokeWidth={1.5} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#06040a]/60 backdrop-blur-xl px-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <p className="text-xs text-gray-600">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white">
              A
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl" style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon size={18} className="text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Conversation Activity</h3>
                  <p className="text-xs text-gray-600 mt-1">Daily conversation volume over the last 7 days</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs text-gray-500 ring-1 ring-white/[0.06]">
                  <div className="h-2 w-2 rounded-full bg-teal-400" />
                  Conversations
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0c0a12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#2dd4bf' }}
                  />
                  <Area type="monotone" dataKey="conversations" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: 'Upload Knowledge Base', desc: 'Add FAQs & policies', color: 'text-teal-400' },
                  { icon: Users, label: 'Invite Agent', desc: 'Add team members', color: 'text-violet-400' },
                  { icon: Mic, label: 'Test Voice Bot', desc: 'Preview the agent', color: 'text-orange-400' },
                ].map((action, i) => (
                  <button key={i} className="flex w-full items-center gap-4 rounded-xl p-4 transition-all hover:bg-white/[0.03] group">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] ${action.color}`}>
                      <action.icon size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors">{action.label}</div>
                      <div className="text-xs text-gray-600">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Conversations</h3>
                <p className="text-xs text-gray-600 mt-1">Latest customer interactions</p>
              </div>
              <button className="text-xs text-teal-400 hover:text-teal-300 transition-colors">View All</button>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${conv.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{conv.customer}</div>
                      <div className="text-xs text-gray-600">{conv.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-600">{conv.duration}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${conv.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'}`}>
                      {conv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}