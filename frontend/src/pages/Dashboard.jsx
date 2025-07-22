import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI, clientAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
    DollarSign,
    FileText,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentClients, setRecentClients] = useState([]);

    useEffect(() => {
        fetchDashboardStats();
        fetchRecentClients();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await invoiceAPI.getDashboardStats();
            setStats(response.data.stats);
        } catch (error) {
            toast.error('Failed to load dashboard statistics');
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentClients = async () => {
        try {
            const response = await clientAPI.getClients({ limit: 5, page: 1 });
            setRecentClients(response.data.clients || []);
        } catch (error) {
            console.error('Error fetching recent clients:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const processStats = (stats) => {
        if (!stats) return {};

        const { invoiceStats = [], totalClients = 0, totalInvoices = 0, recentInvoices = [] } = stats;

        let totalRevenue = 0;
        let pendingAmount = 0;
        let paidInvoices = 0;
        let pendingInvoices = 0;

        invoiceStats.forEach(stat => {
            if (stat._id === 'paid') {
                totalRevenue = stat.totalAmount;
                paidInvoices = stat.count;
            } else if (stat._id === 'pending' || stat._id === 'draft' || stat._id === 'sent') {
                pendingAmount += stat.totalAmount;
                pendingInvoices += stat.count;
            }
        });

        return {
            totalRevenue,
            totalInvoices,
            totalClients,
            pendingAmount,
            paidInvoices,
            pendingInvoices,
            recentInvoices
        };
    };

    const processedStats = processStats(stats);

    const statCards = [
        {
            title: 'Total Revenue',
            value: `$${processedStats?.totalRevenue?.toLocaleString() || '0'}`,
            icon: DollarSign,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Total Invoices',
            value: processedStats?.totalInvoices || '0',
            icon: FileText,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Total Clients',
            value: processedStats?.totalClients || '0',
            icon: Users,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            title: 'Pending Amount',
            value: `$${processedStats?.pendingAmount?.toLocaleString() || '0'}`,
            icon: Clock,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
        },
        {
            title: 'Paid Invoices',
            value: processedStats?.paidInvoices || '0',
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Pending Invoices',
            value: processedStats?.pendingInvoices || '0',
            icon: AlertCircle,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your business.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            <Link
                                to="/clients/new"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add Client</span>
                            </Link>
                            <Link
                                to="/invoices/new"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Create Invoice</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                                    </div>
                                    <div className="ml-3 sm:ml-4">
                                        <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                    {/* Recent Invoices */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Invoices</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                {processedStats?.recentInvoices?.length > 0 ? (
                                    processedStats.recentInvoices.map((invoice) => (
                                        <div key={invoice._id} className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {invoice.invoiceNumber}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">{invoice.clientId?.name || 'Unknown Client'}</p>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                                                </p>
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : invoice.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent invoices</p>
                                )}
                            </div>
                            <div className="mt-6">
                                <Link
                                    to="/invoices"
                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    View all invoices →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Clients */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Clients</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                {recentClients?.length > 0 ? (
                                    recentClients.map((client) => (
                                        <div key={client._id} className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{client.company}</p>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent clients</p>
                                )}
                            </div>
                            <div className="mt-6">
                                <Link
                                    to="/clients"
                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    View all clients →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
