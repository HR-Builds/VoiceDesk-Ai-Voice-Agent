import { useState } from 'react';
import { Outlet, Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Phone, Mic, LogOut, Waves, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'documents', label: 'Documents', icon: FileText },
  { tab: 'agents', label: 'Agents', icon: Users },
  { tab: 'conversations', label: 'Conversations', icon: Phone },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);   // mobile drawer
  const currentTab = searchParams.get('tab') || 'dashboard';

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Waves size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold">VoiceDesk <span className="text-teal-400">AI</span></span>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-500 md:hidden"><X size={20} /></button>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-4">
        {menuItems.map((item) => (
          <Link key={item.tab} to={`/admin?tab=${item.tab}`} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              currentTab === item.tab
                ? 'bg-white/[0.05] text-teal-400 ring-1 ring-teal-500/20'
                : 'text-gray-500 hover:bg-white/[0.03] hover:text-white'
            }`}>
            <item.icon size={17} /> {item.label}
          </Link>
        ))}
        <Link to="/voice" onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-white/[0.03] hover:text-white">
          <Mic size={17} /> Voice Chat
          <span className="ml-auto rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] text-teal-400 ring-1 ring-teal-500/20">LIVE</span>
        </Link>
      </nav>

      <div className="border-t border-white/[0.04] p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold">
            {(user?.name || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="truncate text-[11px] text-gray-600">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/20">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen bg-[#06040a] text-white">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar — mobile pe drawer, desktop pe fixed */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/[0.04] bg-[#0a0812] transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-white/[0.04] bg-[#06040a]/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <button onClick={() => setOpen(true)} className="text-gray-400">
          <LayoutDashboard size={20} />
        </button>
        <span className="font-display font-bold">VoiceDesk <span className="text-teal-400">AI</span></span>
      </div>

      <main className="flex-1 px-4 pb-6 pt-20 md:ml-64 md:px-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}