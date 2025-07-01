import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Checking authentication...');
        if (authService.isAuthenticated()) {
          const userData = authService.getStoredUser();
          console.log('User data from storage:', userData);
          if (userData) {
            dispatch({
              type: 'INITIALIZE',
              payload: { user: userData, isAuthenticated: true },
            });
          } else {
            // Try to fetch user data
            const user = await authService.getCurrentUser();
            console.log('Fetched user from API:', user);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user },
            });
          }
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: { user: null, isAuthenticated: false },
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({
          type: 'LOGOUT',
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: result.user },
        });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};