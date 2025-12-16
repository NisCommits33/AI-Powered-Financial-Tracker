import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TransactionCreate, TransactionType, TransactionWithDetails } from '@/types';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { X } from 'lucide-react';

interface TransactionFormProps {
    transaction?: TransactionWithDetails;
    onSubmit: (data: TransactionCreate) => void;
    onClose: () => void;
    isLoading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
    transaction,
    onSubmit,
    onClose,
    isLoading
}) => {
    const { data: accounts } = useGetAccountsQuery();
    const { data: categories } = useGetCategoriesQuery();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<TransactionCreate>({
        defaultValues: transaction ? {
            amount: transaction.amount,
            transaction_type: transaction.transaction_type,
            description: transaction.description,
            transaction_date: transaction.transaction_date.split('T')[0],
            notes: transaction.notes || '',
            category_id: transaction.category_id,
            account_id: transaction.account_id,
        } : {
            transaction_type: TransactionType.EXPENSE,
            transaction_date: new Date().toISOString().split('T')[0],
        }
    });

    const transactionType = watch('transaction_type');

    useEffect(() => {
        if (transaction) {
            reset({
                amount: transaction.amount,
                transaction_type: transaction.transaction_type,
                description: transaction.description,
                transaction_date: transaction.transaction_date.split('T')[0],
                notes: transaction.notes || '',
                category_id: transaction.category_id,
                account_id: transaction.account_id,
            });
        }
    }, [transaction, reset]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${transactionType === TransactionType.INCOME
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    value={TransactionType.INCOME}
                                    {...register('transaction_type', { required: true })}
                                    className="sr-only"
                                />
                                <span className={`font-medium ${transactionType === TransactionType.INCOME ? 'text-green-700' : 'text-gray-700'
                                    }`}>
                                    💰 Income
                                </span>
                            </label>
                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${transactionType === TransactionType.EXPENSE
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    value={TransactionType.EXPENSE}
                                    {...register('transaction_type', { required: true })}
                                    className="sr-only"
                                />
                                <span className={`font-medium ${transactionType === TransactionType.EXPENSE ? 'text-red-700' : 'text-gray-700'
                                    }`}>
                                    💸 Expense
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register('amount', { required: 'Amount is required', min: 0.01 })}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <input
                            type="text"
                            {...register('description', { required: 'Description is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Grocery shopping"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Account */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account *
                        </label>
                        <select
                            {...register('account_id', { required: 'Account is required', valueAsNumber: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select an account</option>
                            {accounts?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </option>
                            ))}
                        </select>
                        {errors.account_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.account_id.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            {...register('category_id', { valueAsNumber: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a category (optional)</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            {...register('transaction_date', { required: 'Date is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.transaction_date && (
                            <p className="mt-1 text-sm text-red-600">{errors.transaction_date.message}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional notes (optional)"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
