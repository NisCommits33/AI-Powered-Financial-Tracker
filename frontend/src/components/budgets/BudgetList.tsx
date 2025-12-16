import React from 'react';
import { BudgetWithProgress } from '@/types';
import BudgetCard from './BudgetCard';

interface BudgetListProps {
    budgets: BudgetWithProgress[];
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (budgets.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No budgets found</p>
                <p className="text-gray-400 text-sm mt-2">Create your first budget to start tracking your spending</p>
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
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                    <h3 className="text-sm font-medium mb-2 opacity-90">Total Budget</h3>
                    <p className="text-3xl font-bold">${totalBudget.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spent</h3>
                    <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">{overallPercentage.toFixed(1)}% of budget</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Remaining</h3>
                    <p className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(totalRemaining).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{totalRemaining >= 0 ? 'Under budget' : 'Over budget'}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Budget Status</h3>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600">✓ On Track</span>
                            <span className="font-semibold">{onTrackCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-600">⚠ Warning</span>
                            <span className="font-semibold">{warningCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-red-600">✗ Exceeded</span>
                            <span className="font-semibold">{exceededCount}</span>
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
