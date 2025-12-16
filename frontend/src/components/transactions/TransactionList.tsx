import React from 'react';
import { TransactionWithDetails, TransactionType } from '@/types';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionListProps {
    transactions: TransactionWithDetails[];
    onEdit: (transaction: TransactionWithDetails) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    onEdit,
    onDelete,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No transactions found</p>
                <p className="text-gray-400 text-sm mt-2">Add your first transaction to get started</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="flex items-center">
                                        {transaction.transaction_type === TransactionType.INCOME ? (
                                            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                                        )}
                                        <div>
                                            <div className="font-medium">{transaction.description}</div>
                                            {transaction.notes && (
                                                <div className="text-xs text-gray-500 mt-1">{transaction.notes}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {transaction.category_name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {transaction.account_name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                    <span className={transaction.transaction_type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}>
                                        {transaction.transaction_type === TransactionType.INCOME ? '+' : '-'}
                                        ${parseFloat(transaction.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(transaction)}
                                        className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                                        title="Edit transaction"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(transaction.id)}
                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                        title="Delete transaction"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList;
