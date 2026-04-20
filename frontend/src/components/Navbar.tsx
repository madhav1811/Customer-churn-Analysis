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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/analytics">Analytics</NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-text-muted hover:text-primary transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/5 bg-bg-dark/95 backdrop-blur-md"
        >
          <div className="container py-4 space-y-4">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
            {user && <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>}
            <NavLink to="/analytics" onClick={() => setIsMobileMenuOpen(false)}>Analytics</NavLink>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="block text-sm font-bold text-text-muted hover:text-text-main transition py-2 md:py-0"
  >
    {children}
  </Link>
);

export default Navbar;
