import {createContext, useState, useContext, useEffect} from 'react';
import {authAPI} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //Checks if user is already logged in
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (accessToken && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (credentials, userType) => {
    try {
      let response;
      if (userType === 'student') {
        response = await authAPI.loginStudent(credentials);
      } else if (userType === 'company') {
        response = await authAPI.loginCompany(credentials);
      } else if (userType === 'admin') {
        response = await authAPI.loginAdmin(credentials);
      }

      const userData = {
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
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (data, userType) => {
    try {
      let response;
      if (userType === 'student') {
        response = await authAPI.registerStudent(data);
      } else if (userType === 'company') {
        response = await authAPI.registerCompany(data);
      }

      const userData = {
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
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
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
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};