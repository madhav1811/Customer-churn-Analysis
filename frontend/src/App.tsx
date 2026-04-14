import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg-dark flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all for simple analytics placeholder */}
              <Route 
                path="/analytics" 
                element={
                  <div className="container py-20 text-center">
                    <h1 className="text-4xl font-bold gradient-text mb-4">Advanced Analytics</h1>
                    <p className="text-text-muted">Detailed historical analysis module is coming soon.</p>
                  </div>
                } 
              />
            </Routes>
          </main>
          
          <footer className="py-10 border-t border-white/5 text-center text-text-muted text-sm bg-black/20">
            <div className="container">
              &copy; 2024 ChurnGuard AI. All rights reserved. Enterprise-Grade Predictive Analytics.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
