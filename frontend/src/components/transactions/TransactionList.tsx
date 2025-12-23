import React from 'react';
import { TransactionWithDetails, TransactionType } from '@/types';
import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/format';

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
    const user = useAppSelector((state) => state.auth.user);
    const currency = user?.currency || 'USD';

    // Skeleton Loading State
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                    <div className="h-3 w-20 bg-gray-50 rounded"></div>
                                </div>
                            </div>
                            <div className="h-4 w-24 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty State
    if (transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No transactions found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    We couldn't find any transactions matching your criteria. Try adjusting your filters or add a new transaction.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                            <th className="px-6 py-5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {transactions.map((transaction) => {
                            const isIncome = transaction.transaction_type === TransactionType.INCOME;
                            return (
                                <tr key={transaction.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">{transaction.description}</div>
                                                {transaction.notes && (
                                                    <div className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{transaction.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                            {transaction.category_name || 'Uncategorized'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {transaction.account_name || 'Unknown Account'}
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                        <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {isIncome ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), currency)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(transaction)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(transaction.id)}
                                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList;
