import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-white/5 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
            <ShieldCheck size={24} className="group-hover:text-white" />
          </div>
          <span className="text-xl font-black gradient-text">ChurnGuard AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/analytics">Analytics</NavLink>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition group">
                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/10" alt="Profile" />
                <span className="text-sm font-bold hidden sm:block">{user.name}</span>
              </Link>
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-text-muted hover:text-danger transition"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold hover:text-primary transition">Sign In</Link>
              <Link to="/login" className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition">
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-sm font-bold text-text-muted hover:text-text-main transition relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
  </Link>
);

export default Navbar;
