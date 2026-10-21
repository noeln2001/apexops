import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@apexops.internal');
  const [password, setPassword] = useState('ApexOpsAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Login failed. Invalid credentials.');
      }
      const data = await res.json();
      login(data.access_token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121620] border border-[#232b38] rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-[#1f2530] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e10600]/10 border border-[#e10600]/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#e10600]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trackside Operations Login</h3>
              <p className="text-[11px] text-[#94a3b8]">Authenticate to unlock administrative write operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#2d1212] border border-[#522020] rounded-lg text-xs text-[#ff8080] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#171d28] border border-[#2a3649] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#e10600]"
                placeholder="admin@apexops.internal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Passphrase / Secret</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#171d28] border border-[#2a3649] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#e10600]"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#e10600] hover:bg-[#b80500] text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#e10600]/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
          </div>
          <div className="text-center text-[10px] text-[#64748b]">
            Default credentials prefilled for evaluation. Token stored in-memory only.
          </div>
        </form>
      </div>
    </div>
  );
};
