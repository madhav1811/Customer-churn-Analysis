import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Smartphone, Globe, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [method, setMethod] = useState<'email' | 'google' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    await login(method, identifier);
    navigate(from, { replace: true });
  };

  return (
    <div className="flex justify-center items-center min-vh-100 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 max-w-md w-full relative"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black gradient-text">ChurnGuard AI</h1>
          <p className="text-text-muted mt-2">Secure access to enterprise analytics</p>
        </div>

        <div className="flex p-1 bg-white/5 rounded-xl mb-8">
          <button 
            onClick={() => setMethod('email')}
            className={`flex-1 py-2 text-xs font-bold uppercase transition rounded-lg ${method === 'email' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setMethod('google')}
            className={`flex-1 py-2 text-xs font-bold uppercase transition rounded-lg ${method === 'google' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
          >
            Google
          </button>
          <button 
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2 text-xs font-bold uppercase transition rounded-lg ${method === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={method}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                {method === 'email' ? 'Email Address' : method === 'google' ? 'Google Account' : 'Phone Number'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  {method === 'email' ? <Mail size={18} /> : method === 'google' ? <Globe size={18} /> : <Smartphone size={18} />}
                </div>
                <input 
                  type={method === 'email' ? 'email' : 'text'}
                  placeholder={method === 'email' ? 'name@company.com' : method === 'google' ? 'Enter Google email' : '+1 (555) 000-0000'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary transition"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-muted">
          By signing in, you agree to our <span className="text-primary cursor-pointer underline">Terms of Service</span> and <span className="text-primary cursor-pointer underline">Privacy Policy</span>.
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
