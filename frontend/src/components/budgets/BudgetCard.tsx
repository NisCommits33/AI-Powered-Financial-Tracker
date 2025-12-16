import React from 'react';
import { BudgetWithProgress } from '@/types';
import { TrendingDown, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface BudgetCardProps {
    budget: BudgetWithProgress;
    onDelete: (id: number) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onDelete }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on_track':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'exceeded':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'on_track':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'exceeded':
                return <TrendingDown className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'on_track':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'exceeded':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const spent = parseFloat(budget.spent);
    const amount = parseFloat(budget.amount);
    const remaining = parseFloat(budget.remaining);
    const percentage = Math.min(budget.percentage, 100);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    {getStatusIcon(budget.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category_name || 'Uncategorized'}
                    </h3>
                </div>
                <button
                    onClick={() => onDelete(budget.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete budget"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Budget Amount */}
            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spent: ${spent.toFixed(2)}</span>
                    <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full ${getProgressBarColor(budget.status)} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Remaining Amount */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(remaining).toFixed(2)}
                    {remaining < 0 && ' over'}
                </span>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                    {budget.status === 'on_track' && 'On Track'}
                    {budget.status === 'warning' && 'Approaching Limit'}
                    {budget.status === 'exceeded' && 'Budget Exceeded'}
                </span>
            </div>
        </div>
    );
};

export default BudgetCard;
