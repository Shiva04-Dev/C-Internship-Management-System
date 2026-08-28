import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

type UserType = 'Student' | 'Company' | 'Admin';

interface User {
  userId: string;
  email: string;
  name: string;
  userType: UserType;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials, userType: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  data: {
    userID: string;
    email: string;
    name: string;
    userType: UserType;
    accessToken: string;
    refreshToken: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (accessToken && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials, userType: string): Promise<AuthResult> => {
    try {
      let response: AuthResponse;

      if (userType === 'student') {
        response = await authAPI.loginStudent(credentials);
      } else if (userType === 'company') {
        response = await authAPI.loginCompany(credentials);
      } else if (userType === 'admin') {
        response = await authAPI.loginAdmin(credentials);
      } else {
        return { success: false, message: 'Invalid user type' };
      }

      const userData: User = {
        userId: response.data.userID,
        email: response.data.email,
        name: response.data.name,
        userType: response.data.userType,
      };

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};