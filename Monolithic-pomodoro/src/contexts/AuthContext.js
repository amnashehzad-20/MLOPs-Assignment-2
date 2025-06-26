import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await authAPI.getProfile();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Token might be expired or invalid
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      
      // Set token in local storage
      localStorage.setItem('token', response.data.token);
      
      // Set current user
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.signup(username, email, password);
      
      // Set token in local storage
      localStorage.setItem('token', response.data.token);
      
      // Set current user
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      setError('');
      setLoading(true);
      
      await authAPI.forgotPassword(email);
      
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError('');
      setLoading(true);
      
      await authAPI.resetPassword(token, newPassword);
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}