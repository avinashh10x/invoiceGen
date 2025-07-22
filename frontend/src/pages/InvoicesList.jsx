import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Mail,
    Eye,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    Filter,
    DollarSign,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns'; const InvoicesList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                status: statusFilter,
            };

            // Only add search param if there's a search term
            if (debouncedSearchTerm && debouncedSearchTerm.length > 0) {
                params.search = debouncedSearchTerm;
                console.log('Searching for:', debouncedSearchTerm);
            }

            console.log('Fetching invoices with params:', params);
            const response = await invoiceAPI.getInvoices(params);
            console.log('Search results:', response.data.invoices?.length || 0, 'invoices found');
            setInvoices(response.data.invoices || []);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            toast.error('Failed to load invoices');
            console.error('Error fetching invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, statusFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleUpdateStatus = async (invoiceId, newStatus) => {
        try {
            const statusData = { status: newStatus };
            if (newStatus === 'paid') {
                statusData.paidDate = new Date().toISOString();
            }
            await invoiceAPI.updateInvoiceStatus(invoiceId, statusData);
            toast.success(`Invoice status updated to ${newStatus}`);
            await fetchInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update invoice status');
        }
    };

    const handleMarkAsPaid = async (invoiceId) => {
        try {
            await invoiceAPI.markAsPaid(invoiceId);
            toast.success('Invoice marked as paid');
            await fetchInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark invoice as paid');
        }
    };

    const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
        try {
            const response = await invoiceAPI.downloadInvoice(invoiceId);

            // Create blob link to download file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to download invoice');
        }
    };

    const handleSendInvoice = async (invoiceId) => {
        try {
            await invoiceAPI.sendInvoice(invoiceId);
            toast.success('Invoice sent successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invoice');
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        try {
            await invoiceAPI.deleteInvoice(invoiceId);
            toast.success('Invoice deleted successfully');
            await fetchInvoices();
            setShowDeleteModal(false);
            setInvoiceToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete invoice');
        }
    };

    const openDeleteModal = (invoice) => {
        setInvoiceToDelete(invoice);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices</h1>
                            <p className="mt-2 text-gray-600">Manage your invoices and payments</p>
                        </div>
                        <Link
                            to="/invoices/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Invoice</span>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="Search by invoice number, client name, company, or notes..."
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {invoices.map((invoice) => (
                            <div key={invoice._id} className="border-b border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        {getStatusIcon(invoice.status)}
                                        <span
                                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                invoice.status
                                            )}`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                                    </div>
                                </div>
                                
                                <div className="mb-2">
                                    <div className="text-sm font-medium text-gray-900">
                                        {invoice.invoiceNumber}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="text-sm font-medium text-gray-900">
                                        {invoice.clientId?.name || 'Unknown Client'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {invoice.clientId?.company}
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-500 mb-3">
                                    Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        to={`/invoices/${invoice._id}`}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Link>
                                    <Link
                                        to={`/invoices/${invoice._id}/edit`}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                    >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Link>
                                    {invoice.status !== 'paid' && (
                                        <button
                                            onClick={() => handleMarkAsPaid(invoice._id)}
                                            className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Pay
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        PDF
                                    </button>
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => handleUpdateStatus(invoice._id, e.target.value)}
                                        className="text-xs border border-gray-300 rounded px-1 py-1"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {invoice.clientId?.name || 'Unknown Client'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {invoice.clientId?.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-medium text-gray-900">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {formatCurrency(invoice.totalAmount, invoice.currency)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(invoice.status)}
                                                <span
                                                    className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/invoices/${invoice._id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Invoice"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    to={`/invoices/${invoice._id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit Invoice"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                {invoice.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(invoice._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Download PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <select
                                                    value={invoice.status}
                                                    onChange={(e) => handleUpdateStatus(invoice._id, e.target.value)}
                                                    className="text-xs border border-gray-300 rounded px-1 py-1"
                                                    title="Update Status"
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="sent">Sent</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="overdue">Overdue</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => handleSendInvoice(invoice._id)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Send Email"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(invoice)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {invoices.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || statusFilter
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first invoice'}
                        </p>
                        {!searchTerm && !statusFilter && (
                            <div className="mt-6">
                                <Link
                                    to="/invoices/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Invoice
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Delete Invoice</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete invoice "{invoiceToDelete?.invoiceNumber}"? This action cannot
                                    be undone.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4 py-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteInvoice(invoiceToDelete._id)}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesList;
