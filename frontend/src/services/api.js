import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Client API calls
export const clientAPI = {
    getClients: (params = {}) => api.get('/clients', { params }),
    getClient: (id) => api.get(`/clients/${id}`),
    createClient: (clientData) => api.post('/clients', clientData),
    updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
    deleteClient: (id) => api.delete(`/clients/${id}`),
};

// Invoice API calls
export const invoiceAPI = {
    getInvoices: (params = {}) => api.get('/invoices', { params }),
    getInvoice: (id) => api.get(`/invoices/${id}`),
    createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
    updateInvoice: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
    deleteInvoice: (id) => api.delete(`/invoices/${id}`),
    updateInvoiceStatus: (id, statusData) => api.patch(`/invoices/${id}/status`, statusData),
    markAsPaid: (id) => api.patch(`/invoices/${id}/mark-paid`),
    sendInvoice: (id) => api.post(`/invoices/${id}/send-email`),
    downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
    getDashboardStats: () => api.get('/invoices/stats/dashboard'),
};

// Health check
export const healthAPI = {
    check: () => axios.get('http://localhost:5000/health'),
};

export default api;
