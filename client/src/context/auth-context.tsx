import React, { useContext, useEffect, useState } from 'react';
import type { ReactChildren, User } from '../types';
import apiClient from '../api/client';

export type AuthContextType = {
  user: User | null;
  token: string;
  isLoading: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: ReactChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/signin', {
        email,
        password,
      });
      const { user, token } = response.data;

      setUser(user);

      localStorage.setItem('auth_token', token);
      setToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoading(false);
    } catch (error) {
      console.error('Error during login user', error);
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    localStorage.removeItem('auth_token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setToken('');
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/signup', {
        username,
        email,
        password,
      });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('auth_token', token);
      setToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoading(false);
    } catch (error) {
      console.error('Error during registring user', error);
      setIsLoading(false);
    }
  };

  const onLoadAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      apiClient.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${storedToken}`;
      const currentUser = await apiClient.get('/auth/current-user');
      if (!currentUser) {
        localStorage.removeItem('auth_token');
        delete apiClient.defaults.headers.common['Authorization'];
        return;
      }
      const user = currentUser.data;
      setUser(user);
      setToken(storedToken);
    } catch (error) {
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
      setIsLoading(false);
      setUser(null);
      console.error('Error during initial auth', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    onLoadAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        logIn,
        logOut,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Context error');
  }
  return context;
};
