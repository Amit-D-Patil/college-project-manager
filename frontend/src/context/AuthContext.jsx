import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          await fetchProfile();
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Fetch full user profile
  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        
        // Load details
        const profileRes = await API.get('/auth/profile');
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  // Switch role handler
  const switchUserRole = async (role) => {
    try {
      const res = await API.post('/auth/switch-role', { role });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        await fetchProfile();
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Role switch failed');
      throw err;
    }
  };

  // Update local profile state
  const updateLocalProfile = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        logout,
        switchUserRole,
        fetchProfile,
        updateLocalProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
