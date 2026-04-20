import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BarChart3, Users, Zap, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-20 overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mb-32 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-1 px-4 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest border border-primary/20"
        >
          Intelligence for Enterprise Retention
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight tracking-tighter"
        >
          Stop Customer Churn with <span className="gradient-text">Predictive AI.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-text-muted max-w-2xl"
        >
          Leverage advanced Gradient Boosting models to identify at-risk customers before they leave. Increase retention by up to 24% with data-driven strategies.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center gap-2 hover:scale-105 transition"
          >
            Get Started Now <ArrowRight size={20} />
          </button>
          <button className="glass px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition">
            View Case Study
          </button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        <FeatureCard 
          icon={<Zap className="text-accent" />}
          title="Real-Time Analysis"
          description="Instant churn risk assessment as customer parameters change."
        />
        <FeatureCard 
          icon={<BarChart3 className="text-secondary" />}
          title="Visual Insights"
          description="Interactive charts showing exactly where your revenue is leaking."
        />
        <FeatureCard 
          icon={<Shield className="text-success" />}
          title="Retention Strategy"
          description="Automated, model-driven recommendations to keep customers."
        />
      </div>

      {/* Social Proof / Stats */}
      <div className="glass p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-primary/5">
        <div>
          <div className="text-4xl font-black mb-1">84.5%</div>
          <div className="text-text-muted text-xs uppercase tracking-widest font-bold">Model AUC</div>
        </div>
        <div>
          <div className="text-4xl font-black mb-1">24%</div>
          <div className="text-text-muted text-xs uppercase tracking-widest font-bold">Retention Lift</div>
        </div>
        <div>
          <div className="text-4xl font-black mb-1">10k+</div>
          <div className="text-text-muted text-xs uppercase tracking-widest font-bold">Processed</div>
        </div>
        <div>
          <div className="text-4xl font-black mb-1">100%</div>
          <div className="text-text-muted text-xs uppercase tracking-widest font-bold">Automated</div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-8 space-y-4"
  >
    <div className="p-3 bg-white/5 rounded-xl w-fit">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-text-muted text-sm">{description}</p>
  </motion.div>
);

export default LandingPage;
