import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('userRole'));
  const [hasMembership, setHasMembership] = useState(localStorage.getItem('hasMembership') === 'true');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, role, hasMembership, plan, membershipStatus } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('hasMembership', hasMembership);


      setToken(token);
      setRole(role);
      setHasMembership(hasMembership);
      setPlan(plan);

      toast.success('Login successful!');

      return { role, hasMembership };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      toast.success('OTP sent to your email!');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      toast.success('Email verified successfully! Please login.');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasMembership');
    setToken(null);
    setUser(null);
    setRole(null);
    setHasMembership(false);
    window.location.href = '/';
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    role,
    hasMembership,
    plan,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    setHasMembership,
    setPlan
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};