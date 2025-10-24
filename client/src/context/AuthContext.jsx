import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
// --- FIX ---
// Import 'api' as a named import and get the new setup function
import { api, setupApiLogoutHandler } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // --- FIX ---
  // We wrap logout in useCallback to make it a "stable" function.
  // This prevents the useEffect below from running on every render.
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setUser(null);
      // Redirect to login page after logout
      // We check the path to prevent a redirect loop if already on /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, []); // Empty dependency array means this function is created once

  // --- FIX ---
  // This effect runs once when the component mounts.
  // It "injects" our stable logout function into the api.js module.
  useEffect(() => {
    setupApiLogoutHandler(logout);
  }, [logout]); // Pass the stable logout function

  useEffect(() => {
    // Prevent duplicate auth checks (React Strict Mode runs effects twice in dev)
    if (authChecked) return;

    const checkAuth = async () => {
      setAuthChecked(true);
      try {
        const response = await api.get('/auth/me', {
          validateStatus: (status) => {
            // Treat both 200 and 401 as successful responses
            // This prevents axios from throwing an error on 401
            return status === 200 || status === 401;
          }
        });

        // Check if the response was successful
        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          // 401 - not authenticated, which is fine
          setUser(null);
        }
      } catch (error) {
        // Handle other unexpected errors (not 401)
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [authChecked]); // Added authChecked to dependency array

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return {
        success: false,
        message
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      setUser(response.data.user);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return {
        success: false,
        message
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};