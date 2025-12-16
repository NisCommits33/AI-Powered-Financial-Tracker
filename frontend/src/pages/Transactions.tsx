import React, { useState } from 'react';
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import {
    useGetTransactionsQuery,
    useCreateTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
    useExportTransactionsMutation,
} from '@/store/api/transactionsApi';
import { TransactionCreate, TransactionWithDetails, TransactionFilters as ITransactionFilters } from '@/types';

const Transactions: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<ITransactionFilters>({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | undefined>();

    const { data, isLoading, refetch } = useGetTransactionsQuery({ page, size: 20, ...filters });
    const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();
    const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();
    const [deleteTransaction] = useDeleteTransactionMutation();
    const [exportTransactions] = useExportTransactionsMutation();

    const handleCreate = async (formData: TransactionCreate) => {
        try {
            await createTransaction(formData).unwrap();
            setIsFormOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to create transaction:', error);
            alert('Failed to create transaction. Please try again.');
        }
    };

    const handleUpdate = async (formData: TransactionCreate) => {
        if (!editingTransaction) return;
        try {
            await updateTransaction({ id: editingTransaction.id, data: formData }).unwrap();
            setEditingTransaction(undefined);
            setIsFormOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await deleteTransaction(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('Failed to delete transaction. Please try again.');
        }
    };

    const handleEdit = (transaction: TransactionWithDetails) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const blob = await exportTransactions(format).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export transactions:', error);
            alert('Failed to export transactions. Please try again.');
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingTransaction(undefined);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                        <p className="mt-2 text-gray-600">Manage your income and expenses</p>
                    </div>

                    {/* Actions Bar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <TransactionFilters filters={filters} onFilterChange={setFilters} />
                            <button
                                onClick={() => handleExport('csv')}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export CSV</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Transaction</span>
                        </button>
                    </div>

                    {/* Transaction List */}
                    <TransactionList
                        transactions={data?.items || []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />

                    {/* Pagination */}
                    {data && data.pages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(page * 20, data.total)}</span> of{' '}
                                <span className="font-medium">{data.total}</span> transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium">
                                    Page {page} of {data.pages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                                    disabled={page === data.pages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transaction Form Modal */}
                    {isFormOpen && (
                        <TransactionForm
                            transaction={editingTransaction}
                            onSubmit={editingTransaction ? handleUpdate : handleCreate}
                            onClose={handleFormClose}
                            isLoading={isCreating || isUpdating}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Transactions;
