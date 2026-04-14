import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, DollarSign, BarChart3, Info } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ChurnCharts from '../components/ChurnCharts';
import PredictionForm from '../components/PredictionForm';

const API_BASE = 'http://127.0.0.1:8005';

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          axios.get(`${API_BASE}/stats`),
          axios.get(`${API_BASE}/revenue-impact`)
        ]);
        setStats(statsRes.data);
        setRevenue(revenueRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold gradient-text">Analytic Command Center</h1>
        <p className="text-text-muted mt-2">Real-time enterprise customer retention metrics</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl font-semibold animate-pulse">Initializing Analytics...</div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <StatsCard 
              title="Total Customers" 
              value={stats?.metrics.total_customers.toLocaleString()} 
              subtitle="Active subscriber base"
              icon={<Users size={24} />}
              color="#6366f1"
            />
            <StatsCard 
              title="Avg. Churn Rate" 
              value={`${(stats?.metrics.avg_churn_rate * 100).toFixed(1)}%`} 
              subtitle="Historical average"
              icon={<TrendingUp size={24} />}
              trend="down"
              color="#ec4899"
            />
            <StatsCard 
              title="Annual Revenue at Risk" 
              value={`$${(revenue?.annual_projected_loss / 1000).toFixed(0)}k`} 
              subtitle="Projected churn loss"
              icon={<DollarSign size={24} />}
              trend="up"
              color="#f59e0b"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ChurnCharts segmentData={stats?.segments} />
              
              <div className="glass p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-primary" size={20} />
                  <h3 className="font-semibold">Key Insight</h3>
                </div>
                <p className="text-text-muted text-sm">
                  Customers with <span className="text-text-main font-bold">Fiber Optic</span> internet service show a significantly higher churn rate of 
                  <span className="text-danger font-bold"> {(stats?.metrics.fiber_churn_rate * 100).toFixed(1)}%</span>. 
                  Targeted retention strategies for this segment could save approximately 
                  <span className="text-success font-bold"> ${(revenue?.monthly_lost_revenue * 0.2).toLocaleString()}</span> in monthly revenue.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <PredictionForm />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
