import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stylehub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('stylehub_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('stylehub_token', res.data.token);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}`);
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    localStorage.setItem('stylehub_token', res.data.token);
    setUser(res.data.user);
    toast.success('Account created — welcome to StyleHub');
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('stylehub_token');
    setUser(null);
    toast.success('Signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
