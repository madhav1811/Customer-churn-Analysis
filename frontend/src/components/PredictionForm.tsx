import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle2, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskGauge from './RiskGauge';
import FactorImpact from './FactorImpact';

const API_BASE = 'http://127.0.0.1:8000';

const PredictionForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    tenure: 12,
    MonthlyCharges: 70.0,
    TotalCharges: 840.0,
    Contract: 'Month-to-month',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    TechSupport: 'No',
    PaperlessBilling: 'Yes'
  });

  // Automatically predict on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePredict();
    }, 800);
    return () => clearTimeout(timer);
  }, [formData]);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData);
      setResult(response.data);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-danger';
      case 'Medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  return (
    <div className="glass p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <ShieldAlert className="text-accent" size={24} />
        <h2 className="text-xl font-bold">Churn Risk Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 relative z-10">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Tenure (Months)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition text-sm"
                value={formData.tenure}
                onChange={(e) => setFormData({...formData, tenure: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Monthly Bill ($)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition text-sm"
                value={formData.MonthlyCharges}
                onChange={(e) => setFormData({...formData, MonthlyCharges: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Contract Plan</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition text-sm"
                value={formData.Contract}
                onChange={(e) => setFormData({...formData, Contract: e.target.value})}
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Internet Type</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition text-sm"
                value={formData.InternetService}
                onChange={(e) => setFormData({...formData, InternetService: e.target.value})}
              >
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-4 border-t border-white/10 pt-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Customer Analysis 
                  {loading && <RefreshCw size={16} className="animate-spin text-primary" />}
                </h3>
                <span className={`px-4 py-1 rounded-full bg-white/5 text-xs font-black uppercase tracking-widest ${getRiskColor(result.risk_level)}`}>
                  {result.risk_level} Risk
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <RiskGauge probability={result.churn_probability} />
                <FactorImpact impacts={result.feature_impacts} />
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 p-6 bg-primary/5 rounded-2xl border border-primary/20"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Recommended Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.strategies.map((s: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-text-main/90">
                      <div className="bg-success/20 p-1 rounded-full">
                        <CheckCircle2 size={12} className="text-success" />
                      </div>
                      {s}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!result && !loading && (
        <div className="text-center p-10 text-text-muted">
          Adjust parameters to see real-time risk simulation
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
