import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clientAPI } from '../services/api';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Mail,
    Phone,
    Building,
    MapPin,
    MoreVertical,
    Users
} from 'lucide-react';
import toast from 'react-hot-toast'; const ClientsList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getClients({
                page: currentPage,
                limit: 10,
                search: debouncedSearchTerm,
            });
            setClients(response.data.clients || []);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            toast.error('Failed to load clients');
            console.error('Error fetching clients:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    // Fetch clients when page or debounced search term changes
    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleDeleteClient = async (clientId) => {
        try {
            await clientAPI.deleteClient(clientId);
            toast.success('Client deleted successfully');
            await fetchClients(); // Use the callback function
            setShowDeleteModal(false);
            setClientToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete client');
        }
    };

    const openDeleteModal = (client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setClientToDelete(null);
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
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clients</h1>
                            <p className="mt-2 text-gray-600">Manage your client relationships</p>
                        </div>
                        <Link
                            to="/clients/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add Client</span>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="Search clients by name, email, or company..."
                        />
                    </div>
                </div>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {clients.map((client) => (
                        <div
                            key={client._id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                                            {client.name}
                                        </h3>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm truncate">{client.company}</span>
                                        </div>
                                    </div>
                                    <div className="relative ml-2">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm truncate">{client.email}</span>
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center text-gray-600">
                                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm">{client.phone}</span>
                                        </div>
                                    )}
                                    {client.address?.city && (
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm truncate">
                                                {client.address.city}, {client.address.state}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/clients/${client._id}/edit`}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Edit Client"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(client)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                            title="Delete Client"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {clients.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first client'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link
                                    to="/clients/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Client
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
                            <h3 className="text-lg font-medium text-gray-900">Delete Client</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete "{clientToDelete?.name}"? This action cannot
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
                                    onClick={() => handleDeleteClient(clientToDelete._id)}
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

export default ClientsList;
