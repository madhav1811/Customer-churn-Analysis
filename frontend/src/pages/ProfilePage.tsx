import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Shield, History, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="container max-w-4xl py-12">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-text-muted hover:text-text-main mb-8 transition"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 text-center"
        >
          <div className="relative inline-block mb-4">
            <img 
              src={user.photoURL} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-xl"
            />
            <div className="absolute bottom-0 right-0 bg-success p-1.5 rounded-full border-4 border-bg-dark">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-text-muted text-sm">{user.email}</p>
          
          <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
            <button className="w-full glass py-3 flex items-center justify-center gap-2 text-sm hover:bg-white/10 transition">
              <Settings size={16} /> Edit Profile
            </button>
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-danger/10 text-danger py-3 flex items-center justify-center gap-2 text-sm hover:bg-danger/20 transition rounded-xl font-bold"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </motion.div>

        {/* Account Details & Activity */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield size={20} className="text-primary" /> Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Authentication Method</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="p-1 px-3 bg-white/5 rounded-full text-xs font-bold capitalize">
                    {user.method}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Member Since</label>
                <p className="mt-1 text-sm font-semibold">April 2024</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Account Type</label>
                <p className="mt-1 text-sm font-semibold">Enterprise Administrator</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Security Level</label>
                <p className="mt-1 text-sm font-semibold text-success">Verified</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <History size={20} className="text-accent" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                "Performed churn analysis on Fiber Optic segment",
                "Updated retention strategy for High-Risk accounts",
                "Logged in from new IP address: 192.168.1.1",
                "Generated Q1 Revenue Impact report"
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-accent/40"></div>
                  <p className="text-sm opacity-80">{activity}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
