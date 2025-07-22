import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'LOAD_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authAPI.getProfile();
                dispatch({
                    type: 'LOAD_USER',
                    payload: response.data.data,
                });
            } catch (error) {
                dispatch({ type: 'AUTH_ERROR' });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const login = async (credentials) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await authAPI.login(credentials);
            const { token, admin } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(admin));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: admin, token },
            });

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            dispatch({ type: 'AUTH_ERROR' });
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await authAPI.register(userData);
            const { token, admin } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(admin));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: admin, token },
            });

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            dispatch({ type: 'AUTH_ERROR' });
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
        toast.success('Logged out successfully');
    };

    const updateProfile = async (userData) => {
        try {
            const response = await authAPI.updateProfile(userData);
            dispatch({
                type: 'LOAD_USER',
                payload: response.data.data,
            });
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                updateProfile,
                loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
