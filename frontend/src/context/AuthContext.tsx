import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  method: 'email' | 'google' | 'phone';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (method: 'email' | 'google' | 'phone', identifier: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for persisted session
  useEffect(() => {
    const savedUser = localStorage.getItem('churn_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (method: 'email' | 'google' | 'phone', identifier: string) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      name: identifier.split('@')[0] || 'Demo User',
      email: identifier.includes('@') ? identifier : `${identifier}@demo.com`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
      method
    };

    setUser(mockUser);
    localStorage.setItem('churn_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('churn_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
