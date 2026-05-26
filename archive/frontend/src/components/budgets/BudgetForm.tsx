import React from 'react';
import { useForm } from 'react-hook-form';
import { BudgetCreate } from '@/types';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { X, AlertCircle, Calendar, Tag, DollarSign, Target, Clock } from 'lucide-react';

interface BudgetFormProps {
    onSubmit: (data: BudgetCreate) => void;
    onClose: () => void;
    isLoading?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, onClose, isLoading }) => {
    const { data: categories } = useGetCategoriesQuery();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<BudgetCreate>({
        defaultValues: {
            period: 'monthly',
            start_date: new Date().toISOString().split('T')[0],
        }
    });

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-12 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Create Budget
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Set spending limits to save more money</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Featured Input: Amount */}
                        <div className="bg-blue-50/30 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center uppercase tracking-wide">
                                Monthly Limit
                            </label>
                            <div className="relative max-w-xs mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { required: 'Amount is required', min: 0.01 })}
                                    className="block w-full pl-14 pr-4 py-4 text-3xl font-bold text-center bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl text-gray-900 dark:text-white focus:ring-0 transition-all placeholder-gray-300 dark:placeholder-gray-600 shadow-sm"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            {errors.amount && (
                                <div className="flex justify-center items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.amount.message}</span>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    {...register('category_id', { required: 'Category is required', valueAsNumber: true })}
                                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer text-gray-900 dark:text-white"
                                >
                                    <option value="">Select a category</option>
                                    {categories?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.category_id && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.category_id.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <select
                                        {...register('period', { required: 'Period is required' })}
                                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        {...register('start_date', { required: 'Start date is required' })}
                                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 flex gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full h-fit text-blue-600 dark:text-blue-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Smart Alerts</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                                    We'll notify you when you reach 80% of your budget limit. Tracking starts from the selected date.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="budget-form"
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 rounded-xl shadow-lg shadow-gray-900/20 dark:shadow-blue-900/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Budget'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetForm;
