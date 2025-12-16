import React from 'react';
import { useForm } from 'react-hook-form';
import { BudgetCreate } from '@/types';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Create Budget</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            {...register('category_id', { required: 'Category is required', valueAsNumber: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a category</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Amount *
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
                        <p className="mt-1 text-sm text-gray-500">
                            Set a spending limit for this category
                        </p>
                    </div>

                    {/* Period */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Period *
                        </label>
                        <select
                            {...register('period', { required: 'Period is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        {errors.period && (
                            <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                        </label>
                        <input
                            type="date"
                            {...register('start_date', { required: 'Start date is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.start_date && (
                            <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Budget will start tracking from this date
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Budget Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Set realistic budgets based on your spending history</li>
                            <li>• You'll receive alerts when you reach 80% of your budget</li>
                            <li>• Track your progress in real-time as you add transactions</li>
                        </ul>
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
                            {isLoading ? 'Creating...' : 'Create Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;
