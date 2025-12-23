import React, { useState } from 'react';
import { TransactionType, TransactionFilters as ITransactionFilters } from '@/types';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Filter, X, Search, Calendar, DollarSign } from 'lucide-react';

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
        <div className="relative z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${isOpen || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
            >
                <Filter className="w-4 h-4" />
                <span className="font-medium text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white">Filter Transactions</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search description or notes..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Amount Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_amount || ''}
                                            onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm dark:text-white"
                                        />
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_amount || ''}
                                            onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Date Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={filters.start_date || ''}
                                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-600 dark:text-gray-300"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={filters.end_date || ''}
                                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-600 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
                                <div className="flex gap-2">
                                    {[
                                        { label: 'All', value: '' },
                                        { label: 'Income', value: TransactionType.INCOME },
                                        { label: 'Expense', value: TransactionType.EXPENSE }
                                    ].map((type) => (
                                        <button
                                            key={type.label}
                                            onClick={() => handleFilterChange('transaction_type', type.value)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${(filters.transaction_type || '') === type.value
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Account</label>
                                    <select
                                        value={filters.account_id || ''}
                                        onChange={(e) => handleFilterChange('account_id', e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm dark:text-white"
                                    >
                                        <option value="">All Accounts</option>
                                        {accounts?.map((account) => (
                                            <option key={account.id} value={account.id}>{account.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        value={filters.category_id || ''}
                                        onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories?.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl">
                            <button
                                onClick={clearFilters}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-xl transition-all shadow-sm hover:shadow"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TransactionFilters;
