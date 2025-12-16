import React, { useState } from 'react';
import { useGetTransactionsQuery, useCreateTransactionMutation, useUpdateTransactionMutation, useDeleteTransactionMutation, useExportTransactionsMutation } from '@/store/api/transactionsApi';
import { TransactionCreate, TransactionFilters as ITransactionFilters, TransactionWithDetails } from '@/types';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import Navbar from '@/components/layout/Navbar';
import { Download, Plus } from 'lucide-react';

const Transactions: React.FC = () => {
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | undefined>(undefined);
    const [filters, setFilters] = useState<ITransactionFilters>({});

    const { data: transactionsData, isLoading } = useGetTransactionsQuery({
        page,
        size: 10,
        ...filters
    });

    const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
    const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();
    const [deleteTransaction] = useDeleteTransactionMutation();
    const [exportTransactions] = useExportTransactionsMutation();

    const handleCreateOrUpdate = async (data: TransactionCreate) => {
        try {
            if (editingTransaction) {
                await updateTransaction({
                    id: editingTransaction.id,
                    data // API expects { id, data }
                }).unwrap();
            } else {
                await createTransaction(data).unwrap();
            }
            setIsFormOpen(false);
            setEditingTransaction(undefined);
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    };

    const handleEdit = (transaction: TransactionWithDetails) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(id).unwrap();
            } catch (error) {
                console.error('Failed to delete transaction:', error);
            }
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportTransactions('csv').unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export transactions:', error);
            alert('Failed to export transactions. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                    Transactions
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Manage and track your financial activity.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export CSV</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingTransaction(undefined);
                                        setIsFormOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>New Transaction</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters & Content */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <TransactionFilters
                                    filters={filters}
                                    onFilterChange={(newFilters) => {
                                        setFilters(newFilters);
                                        setPage(1); // Reset to first page when filters change
                                    }}
                                />
                                {/* Pagination Info */}
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium text-gray-900">{transactionsData?.items.length || 0}</span> transactions
                                </div>
                            </div>

                            <TransactionList
                                transactions={transactionsData?.items || []}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                isLoading={isLoading}
                            />

                            {/* Pagination Controls */}
                            {transactionsData && transactionsData.pages > 1 && (
                                <div className="flex justify-center gap-2 pt-4">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                                        Page {page} of {transactionsData.pages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(transactionsData.pages, p + 1))}
                                        disabled={page === transactionsData.pages}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Modal Form */}
                        {isFormOpen && (
                            <TransactionForm
                                transaction={editingTransaction}
                                onSubmit={handleCreateOrUpdate}
                                onClose={() => {
                                    setIsFormOpen(false);
                                    setEditingTransaction(undefined);
                                }}
                                isLoading={isCreating || isUpdating}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Transactions;
