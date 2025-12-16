import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TransactionCreate, TransactionType, TransactionWithDetails } from '@/types';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { X, DollarSign, Calendar, AlertCircle, Tag, Wallet, FileText, ArrowUpRight, ArrowDownRight, ChevronRight, Check } from 'lucide-react';

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
            setStep(2); // Skip to details if editing
        }
    }, [transaction, reset]);

    const handleNextStep = () => {
        setStep(2);
    };


    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-12 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {transaction ? 'Edit Transaction' : 'New Transaction'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {transaction ? 'Update transaction details' : `Step ${step} of 2: ${step === 1 ? 'Select Type' : 'Transaction Details'}`}
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
                    <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Step 1: Type Selection */}
                        {step === 1 && !transaction && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                                <button
                                    type="button"
                                    onClick={() => setValue('transaction_type', TransactionType.INCOME)}
                                    className={`group relative flex flex-col items-center justify-center p-8 border-2 rounded-3xl transition-all duration-200 hover:shadow-lg ${transactionType === TransactionType.INCOME
                                        ? 'border-emerald-500 bg-emerald-50/50'
                                        : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-4 transition-colors ${transactionType === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                        <ArrowUpRight className="w-8 h-8" />
                                    </div>
                                    <span className={`text-lg font-bold ${transactionType === TransactionType.INCOME ? 'text-emerald-700' : 'text-gray-600'}`}>Income</span>
                                    <p className="text-sm text-gray-500 mt-2 text-center">Salary, Freelance, etc.</p>

                                    {transactionType === TransactionType.INCOME && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in-50">
                                            <Check className="w-6 h-6 bg-emerald-500 text-white rounded-full p-1" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setValue('transaction_type', TransactionType.EXPENSE)}
                                    className={`group relative flex flex-col items-center justify-center p-8 border-2 rounded-3xl transition-all duration-200 hover:shadow-lg ${transactionType === TransactionType.EXPENSE
                                        ? 'border-rose-500 bg-rose-50/50'
                                        : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-4 transition-colors ${transactionType === TransactionType.EXPENSE ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400 group-hover:bg-rose-50 group-hover:text-rose-600'}`}>
                                        <ArrowDownRight className="w-8 h-8" />
                                    </div>
                                    <span className={`text-lg font-bold ${transactionType === TransactionType.EXPENSE ? 'text-rose-700' : 'text-gray-600'}`}>Expense</span>
                                    <p className="text-sm text-gray-500 mt-2 text-center">Food, Rent, Shopping, etc.</p>

                                    {transactionType === TransactionType.EXPENSE && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in-50">
                                            <Check className="w-6 h-6 bg-rose-500 text-white rounded-full p-1" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {(step === 2 || transaction) && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                {/* Amount - Featured Input */}
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
                                        <div className="flex justify-center items-center gap-1 mt-2 text-red-600 text-sm animate-in slide-in-from-top-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.amount.message}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
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
                                                className="block w-full pl-10 pr-3 py-3 bg-white focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="What was this for?"
                                            />
                                        </div>
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Account */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Wallet className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <select
                                                    {...register('account_id', { required: 'Account is required', valueAsNumber: true })}
                                                    className="block w-full pl-10 pr-4 py-3 bg-white focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select Account</option>
                                                    {accounts?.map((account) => (
                                                        <option key={account.id} value={account.id}>
                                                            {account.name} (${parseFloat(account.balance).toFixed(2)})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.account_id && (
                                                <p className="text-sm text-red-600 mt-1">{errors.account_id.message}</p>
                                            )}
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
                                                    className="block w-full pl-10 pr-4 py-3 bg-white focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    className="block w-full pl-10 pr-4 py-3 bg-white focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                            <input
                                                type="text"
                                                {...register('notes')}
                                                className="block w-full px-4 py-3 bg-white focus:bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Optional..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 z-10">
                    {step === 1 && !transaction ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/20 transition-all transform active:scale-95"
                            >
                                Continue <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </>
                    ) : (
                        <>
                            {!transaction && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                form="transaction-form"
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    transaction ? 'Save Changes' : 'Create Transaction'
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
