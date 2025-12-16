import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AccountCreate, AccountType, Account } from '@/types';
import {
    X, Wallet, CreditCard, PiggyBank, Banknote,
    DollarSign, TrendingUp, Check, ChevronRight, AlertCircle, LayoutDashboard
} from 'lucide-react';

interface AccountFormProps {
    account?: Account;
    onSubmit: (data: AccountCreate) => void;
    onClose: () => void;
    isLoading?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSubmit, onClose, isLoading }) => {
    const [step, setStep] = useState(1);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<AccountCreate>({
        defaultValues: {
            account_type: AccountType.CHECKING,
            balance: '0.00',
            currency: 'USD',
        }
    });

    const selectedType = watch('account_type');

    useEffect(() => {
        if (account) {
            reset({
                name: account.name,
                account_type: account.account_type,
                balance: account.balance,
                currency: account.currency,
                description: account.description || '',
            });
            // If editing, skip directly to details step
            setStep(2);
        }
    }, [account, reset]);

    const accountTypes = [
        { id: AccountType.CHECKING, label: 'Checking', icon: Wallet, description: 'Daily spending & bills', color: 'bg-blue-50 text-blue-600 border-blue-200' },
        { id: AccountType.SAVINGS, label: 'Savings', icon: PiggyBank, description: 'Emergency funds & goals', color: 'bg-green-50 text-green-600 border-green-200' },
        { id: AccountType.CREDIT, label: 'Credit Card', icon: CreditCard, description: 'Credit lines & rewards', color: 'bg-purple-50 text-purple-600 border-purple-200' },
        { id: AccountType.INVESTMENT, label: 'Investment', icon: TrendingUp, description: 'Stocks, ETFs & Crypto', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        { id: AccountType.LOAN, label: 'Loan', icon: DollarSign, description: 'Personal or Mortgage', color: 'bg-red-50 text-red-600 border-red-200' },
        { id: AccountType.CASH, label: 'Cash', icon: Banknote, description: 'Physical cash on hand', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    ];

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'NPR', symbol: 'Rs.', name: 'Nepali Rupee' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    ];

    const handleNextStep = () => {
        if (step === 1) setStep(2);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-12 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {account ? 'Edit Account' : 'Add New Account'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {account ? 'Update account details' : `Step ${step} of 2: ${step === 1 ? 'Select Type' : 'Account Details'}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Step 1: Account Type Selection */}
                        {(step === 1 && !account) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-right-4 duration-300">
                                {accountTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = selectedType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setValue('account_type', type.id)}
                                            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 group hover:shadow-md ${isSelected
                                                ? `${type.color} border-current shadow-sm`
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl w-fit ${isSelected ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-gray-600'}`} />
                                            </div>
                                            <div className="mt-4">
                                                <h3 className={`font-bold ${isSelected ? 'text-current' : 'text-gray-900'}`}>{type.label}</h3>
                                                <p className={`text-xs mt-1 ${isSelected ? 'opacity-80' : 'text-gray-500'}`}>{type.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 animate-in zoom-in-50">
                                                    <Check className="w-5 h-5 bg-current rounded-full text-white p-1" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Step 2: Details Form */}
                        {(step === 2 || account) && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                {/* Account Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LayoutDashboard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            {...register('name', { required: 'Please name your account' })}
                                            className={`block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'bg-red-50 border-red-200' : 'bg-gray-50 focus:bg-white'}`}
                                            placeholder="e.g. Primary Checking"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.name && (
                                        <div className="flex items-center gap-1 mt-1.5 text-red-600 text-sm animate-in slide-in-from-top-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.name.message}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Balance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {account ? 'Current Balance' : 'Initial Balance'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 font-semibold">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('balance')}
                                                className="block w-full pl-8 pr-3 py-3 bg-gray-50 focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                        <select
                                            {...register('currency')}
                                            className="block w-full px-4 py-3 bg-gray-50 focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                                        >
                                            {currencies.map(c => (
                                                <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        className="block w-full px-4 py-3 bg-gray-50 focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Add any notes about this account..."
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 z-10">
                    {(step === 2 && !account) && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Back
                        </button>
                    )}

                    {step === 1 && !account ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
                        >
                            Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="account-form"
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    account ? 'Save Changes' : 'Create Account'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountForm;
