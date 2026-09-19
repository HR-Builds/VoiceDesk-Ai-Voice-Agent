import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Waves, Mail, Lock, User, Building2, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !companyName.trim() || !email.trim() || !password) {
      setError('Sab fields bharo pehle.');
      return;
    }
    if (password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    setBusy(true); setError('');
    try {
      await register(email.trim(), password, fullName.trim(), companyName.trim());
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06040a] px-4 text-white">
      <div className="pointer-events-none fixed -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[150px]" />
      <div className="relative w-full max-w-sm rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700">
            <Waves size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">VoiceDesk <span className="text-teal-400">AI</span></h1>
          <p className="mt-1 text-xs text-gray-500">Naya account banao</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-3 text-xs text-rose-400 ring-1 ring-rose-500/20">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name"
              className="w-full rounded-xl bg-white/[0.03] py-3 pl-10 pr-4 text-sm placeholder-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-teal-500/50" />
          </div>
          <div className="relative">
            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name"
              className="w-full rounded-xl bg-white/[0.03] py-3 pl-10 pr-4 text-sm placeholder-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-teal-500/50" />
          </div>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              className="w-full rounded-xl bg-white/[0.03] py-3 pl-10 pr-4 text-sm placeholder-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-teal-500/50" />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full rounded-xl bg-white/[0.03] py-3 pl-10 pr-4 text-sm placeholder-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-teal-500/50" />
          </div>
          <button type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-semibold text-black disabled:opacity-50">
            <UserPlus size={16} /> {busy ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-gray-600">
          Pehle se account hai? <Link to="/login" className="text-teal-400">Login karo</Link>
        </p>
      </div>
    </div>
  );
}