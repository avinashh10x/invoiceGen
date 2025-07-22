import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceAPI, clientAPI } from '../services/api';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../utils/currency';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        clientId: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        taxRate: 0,
        dueDate: '',
        notes: '',
        currency: 'USD',
        status: 'draft',
        paidDate: '',
    });
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: 0,
        tax: 0,
        total: 0,
    });

    useEffect(() => {
        fetchClients();
        if (isEditing) {
            fetchInvoice();
        }
    }, [id, isEditing]);

    useEffect(() => {
        calculateTotals();
    }, [formData.items, formData.taxRate]);

    const fetchClients = async () => {
        try {
            const response = await clientAPI.getClients({ limit: 100 });
            setClients(response.data.clients);
        } catch (error) {
            toast.error('Failed to load clients');
        }
    };

    const fetchInvoice = async () => {
        try {
            const response = await invoiceAPI.getInvoice(id);
            const invoice = response.data.invoice;
            setFormData({
                clientId: invoice.clientId._id || invoice.clientId,
                items: invoice.items,
                taxRate: invoice.taxRate,
                dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
                notes: invoice.notes,
                currency: invoice.currency,
                status: invoice.status,
                paidDate: invoice.paidDate ? new Date(invoice.paidDate).toISOString().split('T')[0] : '',
            });
        } catch (error) {
            toast.error('Failed to load invoice data');
            navigate('/invoices');
        } finally {
            setInitialLoading(false);
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
        }, 0);

        const tax = subtotal * (parseFloat(formData.taxRate) || 0) / 100;
        const total = subtotal + tax;

        setCalculatedTotals({ subtotal, tax, total });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = formData.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setFormData({
            ...formData,
            items: updatedItems,
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, price: 0 }],
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const updatedItems = formData.items.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                items: updatedItems,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate form
        if (!formData.clientId) {
            toast.error('Please select a client');
            setLoading(false);
            return;
        }

        if (formData.items.some(item => !item.description || item.quantity <= 0 || item.price < 0)) {
            toast.error('Please fill in all item details correctly');
            setLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity),
                    price: parseFloat(item.price),
                })),
                taxRate: parseFloat(formData.taxRate),
            };

            if (isEditing) {
                await invoiceAPI.updateInvoice(id, submitData);
                toast.success('Invoice updated successfully');
            } else {
                await invoiceAPI.createInvoice(submitData);
                toast.success('Invoice created successfully');
            }
            navigate('/invoices');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {isEditing ? 'Update invoice details' : 'Create a new invoice for your client'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white shadow-sm rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Invoice Details */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                                        Client *
                                    </label>
                                    <select
                                        id="clientId"
                                        name="clientId"
                                        required
                                        value={formData.clientId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map((client) => (
                                            <option key={client._id} value={client._id}>
                                                {client.name} - {client.company}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                        required
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                        Currency
                                    </label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {SUPPORTED_CURRENCIES.map(currency => (
                                            <option key={currency.code} value={currency.code}>
                                                {currency.code} ({currency.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {formData.status === 'paid' && (
                                    <div>
                                        <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700">
                                            Paid Date
                                        </label>
                                        <input
                                            type="date"
                                            id="paidDate"
                                            name="paidDate"
                                            value={formData.paidDate}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        id="taxRate"
                                        name="taxRate"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.taxRate}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                                <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 md:space-y-0">
                                        {/* Desktop layout */}
                                        <div className="hidden md:grid md:grid-cols-12 gap-4 items-end">
                                            <div className="col-span-5">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Description *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter item description"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Price *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Total
                                                </label>
                                                <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                                                    {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), formData.currency)}
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={formData.items.length === 1}
                                                    className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile layout */}
                                        <div className="md:hidden space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Description *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter item description"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Quantity *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0.01"
                                                        step="0.01"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Price *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Total: </span>
                                                    <span className="text-sm font-semibold">
                                                        {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), formData.currency)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={formData.items.length === 1}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-center sm:justify-end">
                                <div className="w-full max-w-xs sm:w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(calculatedTotals.subtotal, formData.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                                        <span className="font-medium">{formatCurrency(calculatedTotals.tax, formData.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(calculatedTotals.total, formData.currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                value={formData.notes}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any additional notes for this invoice..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/invoices')}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isEditing ? 'Update Invoice' : 'Create Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InvoiceForm;
