import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TransactionCreate, TransactionType, TransactionWithDetails } from '@/types';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/format';
import { X, DollarSign, Calendar, Tag, Wallet, FileText, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';

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
    const [step, setStep] = useState(1);
    const { data: accounts } = useGetAccountsQuery();
    const { data: categories } = useGetCategoriesQuery();
    const user = useAppSelector((state) => state.auth.user);
    const currency = user?.currency || 'USD';

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<TransactionCreate>({
        defaultValues: {
            transaction_type: TransactionType.EXPENSE,
            transaction_date: new Date().toISOString().split('T')[0],
        }
    });

    const transactionType = watch('transaction_type');
    const selectedAccountId = watch('account_id');
    const amount = watch('amount');

    // Derived state for insights
    const selectedAccount = accounts?.find(a => a.id === selectedAccountId);
    const currentBalance = selectedAccount ? parseFloat(selectedAccount.balance) : 0;
    const transactionAmount = amount ? parseFloat(amount.toString()) : 0;

    let remainingBalance = currentBalance;
    if (transactionType === TransactionType.INCOME) {
        remainingBalance += transactionAmount;
    } else {
        remainingBalance -= transactionAmount;
    }

    const isOverdraft = remainingBalance < 0;

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
            setStep(3); // Go straight to details if editing
        }
    }, [transaction, reset]);

    const handleBack = () => {
        setStep(Math.max(1, step - 1));
    };

    const selectAccount = (accountId: number) => {
        setValue('account_id', accountId);
        setStep(3);
    };

    const getStepTitle = () => {
        if (transaction) return 'Edit Transaction';
        switch (step) {
            case 1: return 'Transaction Type';
            case 2: return 'Select Account';
            case 3: return 'Details & Review';
            default: return 'New Transaction';
        }
    };

    const getStepDescription = () => {
        if (transaction) return 'Update details below';
        switch (step) {
            case 1: return 'Is this money coming in or going out?';
            case 2: return 'Which account is this transaction for?';
            case 3: return 'Enter amount and details';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-12 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        {step > 1 && !transaction && (
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                {getStepTitle()}
                            </h2>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {getStepDescription()}
                            </p>
                        </div>
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
                    <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 h-full">

                        {/* Step 1: Type Selection */}
                        {step === 1 && !transaction && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300 h-full content-center">
                                <button
                                    type="button"
                                    onClick={() => { setValue('transaction_type', TransactionType.INCOME); setStep(2); }}
                                    className="group relative flex flex-col items-center justify-center p-8 border-2 rounded-3xl transition-all duration-200 hover:shadow-lg border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30"
                                >
                                    <div className="p-6 rounded-full mb-6 bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                        <ArrowUpRight className="w-10 h-10" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-700 group-hover:text-emerald-700">Income</span>
                                    <p className="text-sm text-gray-500 mt-2 text-center max-w-[150px]">Salary, Deposits, Refunds, etc.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setValue('transaction_type', TransactionType.EXPENSE); setStep(2); }}
                                    className="group relative flex flex-col items-center justify-center p-8 border-2 rounded-3xl transition-all duration-200 hover:shadow-lg border-gray-100 hover:border-rose-200 hover:bg-rose-50/30"
                                >
                                    <div className="p-6 rounded-full mb-6 bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform">
                                        <ArrowDownRight className="w-10 h-10" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-700 group-hover:text-rose-700">Expense</span>
                                    <p className="text-sm text-gray-500 mt-2 text-center max-w-[150px]">Purchases, Bills, Fees, etc.</p>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Account Selection */}
                        {step === 2 && !transaction && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {accounts?.map((account) => (
                                        <button
                                            key={account.id}
                                            type="button"
                                            onClick={() => selectAccount(account.id)}
                                            className={`relative p-5 text-left border rounded-2xl transition-all hover:shadow-md ${selectedAccountId === account.id
                                                ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-blue-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-900">{account.name}</span>
                                                {selectedAccountId === account.id && (
                                                    <Check className="w-5 h-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-800">
                                                    {formatCurrency(parseFloat(account.balance), currency)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 capitalize">{account.account_type}</p>
                                        </button>
                                    ))}

                                    {/* Add New Account Placeholder */}
                                    <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2 min-h-[120px]">
                                        <Wallet className="w-6 h-6" />
                                        <span className="text-sm font-medium">Don't see your account?</span>
                                    </div>
                                </div>
                                <input type="hidden" {...register('account_id', { required: 'Please select an account' })} />
                                {errors.account_id && (
                                    <p className="text-center text-red-500 text-sm font-medium animate-pulse">
                                        {errors.account_id.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 3: Details & Insights */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                {/* Insight Card */}
                                {selectedAccount && (
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <Wallet className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis for</p>
                                                <p className="font-bold text-gray-900">{selectedAccount.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-right">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Current Balance</p>
                                                <p className="font-medium text-gray-900">{formatCurrency(currentBalance, currency)}</p>
                                            </div>
                                            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Remaining Balance</p>
                                                <div className={`flex items-center gap-1.5 font-bold text-lg ${isOverdraft ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {isOverdraft ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                                    {formatCurrency(remainingBalance, currency)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Amount Input */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center uppercase tracking-wide">
                                        {transactionType === TransactionType.INCOME ? 'Amount Received' : 'Amount Spent'}
                                    </label>
                                    <div className="relative max-w-xs mx-auto">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <DollarSign className={`w-8 h-8 ${transactionType === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`} />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('amount', { required: 'Amount is required', min: 0.01 })}
                                            className="block w-full pl-14 pr-4 py-4 text-4xl font-bold text-center bg-transparent border-b-2 border-gray-200 focus:border-blue-500 text-gray-900 focus:ring-0 transition-all placeholder-gray-300"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="text-center text-red-600 text-sm mt-2">{errors.amount.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                {...register('description', { required: 'Description is required' })}
                                                className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="What was this for?"
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Tag className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                {...register('category_id', { valueAsNumber: true })}
                                                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                {categories?.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                {...register('transaction_date', { required: 'Date is required' })}
                                                className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                        <input
                                            type="text"
                                            {...register('notes')}
                                            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Optional..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 z-10">
                    {step === 3 && (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="transaction-form"
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    transaction ? 'Save Changes' : 'Confirm Transaction'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;
