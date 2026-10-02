import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  setToken as saveToken,
  setRefreshToken as saveRefreshToken,
  clearTokens,
} from '../utils/token';

export const AuthContext = createContext();

const TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const USER_STORAGE_KEY = 'usuario';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeGetItem = (key) => {
      const value = localStorage.getItem(key);
      if (!value || value === 'undefined' || value === 'null') {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    };

    const storedToken = safeGetItem(TOKEN_STORAGE_KEY);
    const storedRefreshToken = safeGetItem(REFRESH_TOKEN_STORAGE_KEY);
    const storedUser = safeGetItem(USER_STORAGE_KEY);

    const parseStoredUser = (value) => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
    };

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(parseStoredUser(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      if (storedRefreshToken) {
        saveRefreshToken(storedRefreshToken);
      }
    } else {
      clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
      delete api.defaults.headers.common['Authorization'];
    }

    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const payload = response.data?.data || response.data;
      const { token, usuario, refreshToken } = payload || {};

      if (!token || !usuario || !refreshToken) {
        throw new Error('Resposta de login inválida');
      }

      saveToken(token);
      saveRefreshToken(refreshToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setToken(token);
      setUsuario(usuario);

      return payload;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  };

  const register = async (nome, email, senha, telefone, setor) => {
    try {
      const response = await api.post('/auth/register', { nome, email, senha, telefone, setor });
      const payload = response.data?.data || response.data;
      const { token, usuario, refreshToken } = payload || {};

      if (!token || !usuario || !refreshToken) {
        throw new Error('Resposta de cadastro inválida');
      }

      saveToken(token);
      saveRefreshToken(refreshToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setToken(token);
      setUsuario(usuario);

      return payload;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao cadastrar usuário' };
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
