import React from 'react';
import { BudgetWithProgress } from '@/types';
import BudgetCard from './BudgetCard';
import { Wallet, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetListProps {
    budgets: BudgetWithProgress[];
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, onDelete, isLoading }) => {
    // Skeleton Loading
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-64 animate-pulse">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 bg-gray-100 rounded-2xl"></div>
                            <div className="h-8 w-16 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-6 w-3/4 bg-gray-100 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                        <div className="mt-8 space-y-2">
                            <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-gray-100 rounded"></div>
                                <div className="h-4 w-20 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty State
    if (budgets.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Wallet className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No budgets set</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                    Create a budget to track your spending and save more money this month.
                </p>
            </div>
        );
    }

    // Calculate summary statistics
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;

    // Count budgets by status
    const onTrackCount = budgets.filter(b => b.status === 'on_track').length;
    const warningCount = budgets.filter(b => b.status === 'warning').length;
    const exceededCount = budgets.filter(b => b.status === 'exceeded').length;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Budget */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-blue-100 font-medium mb-1">Total Budget</p>
                        <h3 className="text-3xl font-bold">${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                            <span>Monthly Limit</span>
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-4 right-4 p-2 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors">
                        <TrendingDown className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Spent</p>
                        <h3 className="text-3xl font-bold text-gray-900">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-gray-600">{overallPercentage.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Remaining */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Remaining</p>
                        <h3 className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ${Math.abs(totalRemaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className={`text-sm mt-1 font-medium ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {totalRemaining >= 0 ? 'Safe to spend' : 'Over budget'}
                        </p>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <h3 className="text-gray-500 font-medium mb-4">Health Check</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-700">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">On Track</span>
                            </div>
                            <span className="text-sm font-bold bg-white px-2 py-0.5 rounded-lg shadow-sm">{onTrackCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-700">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-semibold">Warning</span>
                            </div>
                            <span className="text-sm font-bold bg-white px-2 py-0.5 rounded-lg shadow-sm">{warningCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 text-rose-700">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-semibold">Exceeded</span>
                            </div>
                            <span className="text-sm font-bold bg-white px-2 py-0.5 rounded-lg shadow-sm">{exceededCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                    <BudgetCard
                        key={budget.id}
                        budget={budget}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default BudgetList;
