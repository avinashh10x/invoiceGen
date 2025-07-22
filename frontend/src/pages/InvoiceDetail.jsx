import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
    ArrowLeft,
    Edit,
    Mail,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Calendar,
    Building,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const InvoiceDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const response = await invoiceAPI.getInvoice(id);
            setInvoice(response.data.invoice);
        } catch (error) {
            toast.error('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        try {
            await invoiceAPI.markAsPaid(id);
            toast.success('Invoice marked as paid');
            fetchInvoice();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark invoice as paid');
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await invoiceAPI.downloadInvoice(id);

            // Create blob link to download file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to download invoice');
        }
    };

    const handleSendInvoice = async () => {
        try {
            await invoiceAPI.sendInvoice(id);
            toast.success('Invoice sent successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invoice');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'overdue':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Invoice not found</h3>
                    <p className="mt-1 text-sm text-gray-500">The invoice you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/invoices')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Invoices
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Invoices
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Invoice {invoice.invoiceNumber}
                            </h1>
                            <div className="mt-2 flex items-center">
                                {getStatusIcon(invoice.status)}
                                <span
                                    className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                                        invoice.status
                                    )}`}
                                >
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            {invoice.status !== 'paid' && (
                                <button
                                    onClick={handleMarkAsPaid}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Mark as Paid</span>
                                </button>
                            )}
                            <button
                                onClick={handleSendInvoice}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                                <span>Send Email</span>
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Download className="h-5 w-5" />
                                <span>Download PDF</span>
                            </button>
                            <button
                                onClick={() => navigate(`/invoices/${id}/edit`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Edit className="h-5 w-5" />
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-8">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Issue Date</p>
                                <p className="font-medium">{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
                                <p className="text-sm text-gray-600 mt-2">Due Date</p>
                                <p className="font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>

                        {/* Client Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="font-medium">{invoice.clientId.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{invoice.clientId.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{invoice.clientId.email}</span>
                                    </div>
                                    {invoice.clientId.address && (
                                        <div className="mt-2">
                                            <p className="text-gray-600">
                                                {invoice.clientId.address.street && `${invoice.clientId.address.street}, `}
                                                {invoice.clientId.address.city && `${invoice.clientId.address.city}, `}
                                                {invoice.clientId.address.state} {invoice.clientId.address.zipCode}
                                            </p>
                                            <p className="text-gray-600">{invoice.clientId.address.country}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Currency:</span>
                                        <span className="font-medium">{invoice.currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax Rate:</span>
                                        <span className="font-medium">{invoice.taxRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Status:</span>
                                        <span className={`font-medium ${invoice.status === 'paid' ? 'text-green-600' :
                                            invoice.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                                    {formatCurrency(item.price, invoice.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(item.quantity * item.price, invoice.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                                        <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span>Total:</span>
                                        <span className="flex items-center">
                                            <DollarSign className="h-5 w-5 mr-1" />
                                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
