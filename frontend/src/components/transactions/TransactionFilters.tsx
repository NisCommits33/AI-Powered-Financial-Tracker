import React, { useState } from 'react';
import { TransactionType, TransactionFilters as ITransactionFilters } from '@/types';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Filter, X } from 'lucide-react';

interface TransactionFiltersProps {
    filters: ITransactionFilters;
    onFilterChange: (filters: ITransactionFilters) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: accounts } = useGetAccountsQuery();
    const { data: categories } = useGetCategoriesQuery();

    const handleFilterChange = (key: keyof ITransactionFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value || undefined });
    };

    const clearFilters = () => {
        onFilterChange({});
        setIsOpen(false);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Filter Transactions</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search description or notes..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Amount Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={filters.min_amount || ''}
                                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.max_amount || ''}
                                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Transaction Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={filters.transaction_type || ''}
                                onChange={(e) => handleFilterChange('transaction_type', e.target.value as TransactionType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value={TransactionType.INCOME}>Income</option>
                                <option value={TransactionType.EXPENSE}>Expense</option>
                            </select>
                        </div>

                        {/* Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                            <select
                                value={filters.account_id || ''}
                                onChange={(e) => handleFilterChange('account_id', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Accounts</option>
                                {accounts?.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filters.category_id || ''}
                                onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories?.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 flex justify-between">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionFilters;
