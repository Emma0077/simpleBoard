'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // 하드코딩된 사용자 정보 확인
    if (email === 'admin@growthcamp.site' && password === 'innovationCoE@') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 