import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountCreate, AccountType, Account } from '@/types';
import { X } from 'lucide-react';

interface AccountFormProps {
    account?: Account;
    onSubmit: (data: AccountCreate) => void;
    onClose: () => void;
    isLoading?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSubmit, onClose, isLoading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<AccountCreate>({
        defaultValues: account ? {
            name: account.name,
            account_type: account.account_type,
            balance: account.balance,
            currency: account.currency,
            description: account.description || '',
        } : {
            account_type: AccountType.CHECKING,
            balance: '0.00',
            currency: 'USD',
        }
    });

    useEffect(() => {
        if (account) {
            reset({
                name: account.name,
                account_type: account.account_type,
                balance: account.balance,
                currency: account.currency,
                description: account.description || '',
            });
        }
    }, [account, reset]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {account ? 'Edit Account' : 'Add Account'}
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
                    {/* Account Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name *
                        </label>
                        <input
                            type="text"
                            {...register('name', { required: 'Account name is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Main Checking Account"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type *
                        </label>
                        <select
                            {...register('account_type', { required: 'Account type is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={AccountType.CHECKING}>💳 Checking Account</option>
                            <option value={AccountType.SAVINGS}>🏦 Savings Account</option>
                            <option value={AccountType.CREDIT}>💳 Credit Card</option>
                            <option value={AccountType.CASH}>💵 Cash</option>
                        </select>
                        {errors.account_type && (
                            <p className="mt-1 text-sm text-red-600">{errors.account_type.message}</p>
                        )}
                    </div>

                    {/* Initial Balance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {account ? 'Current Balance' : 'Initial Balance'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                {...register('balance')}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            {account ? 'Update the current balance of this account' : 'Enter the starting balance for this account'}
                        </p>
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                        </label>
                        <select
                            {...register('currency')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional notes about this account"
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
                            {isLoading ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountForm;
