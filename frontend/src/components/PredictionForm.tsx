import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, formData);
      setResult(response.data);
    } catch (error) {
      console.error('Error predicting:', error);
      alert('Failed to connect to backend. Please make sure the server is running.');
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
    <div className="glass p-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="text-accent" size={24} />
        <h2 className="text-xl font-bold">Churn Risk Prediction Tool</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Tenure (Months)</label>
          <input 
            type="number" 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition"
            value={formData.tenure}
            onChange={(e) => setFormData({...formData, tenure: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Monthly Charges ($)</label>
          <input 
            type="number" 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition"
            value={formData.MonthlyCharges}
            onChange={(e) => setFormData({...formData, MonthlyCharges: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Contract</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition"
            value={formData.Contract}
            onChange={(e) => setFormData({...formData, Contract: e.target.value})}
          >
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Internet Service</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary transition"
            value={formData.InternetService}
            onChange={(e) => setFormData({...formData, InternetService: e.target.value})}
          >
            <option value="Fiber optic">Fiber optic</option>
            <option value="DSL">DSL</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Run Assessment'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Result for Customer</h3>
            <span className={`px-4 py-1 rounded-full bg-white/5 font-bold ${getRiskColor(result.risk_level)}`}>
              {result.risk_level} Risk
            </span>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold">{Math.round(result.churn_probability * 100)}%</div>
            <div className="text-text-muted">Probability of Churn</div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">Retention Strategies</h4>
            <ul className="space-y-2">
              {result.strategies.map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
