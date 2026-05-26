import React from 'react';
import { BudgetWithProgress } from '@/types';
import { TrendingDown, AlertTriangle, CheckCircle, Trash2, Calendar } from 'lucide-react';

interface BudgetCardProps {
    budget: BudgetWithProgress;
    onDelete: (id: number) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onDelete }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on_track':
                return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'warning':
                return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'exceeded':
                return 'text-rose-600 bg-rose-50 border-rose-100';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'on_track':
                return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
            case 'warning':
                return 'bg-gradient-to-r from-amber-400 to-amber-500';
            case 'exceeded':
                return 'bg-gradient-to-r from-rose-400 to-rose-500';
            default:
                return 'bg-gray-400';
        }
    };

    const spent = parseFloat(budget.spent);
    const amount = parseFloat(budget.amount);
    const remaining = amount - spent;
    const percentage = Math.min((spent / amount) * 100, 100);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${getStatusColor(budget.status)}`}>
                        {budget.status === 'on_track' && <CheckCircle className="w-6 h-6" />}
                        {budget.status === 'warning' && <AlertTriangle className="w-6 h-6" />}
                        {budget.status === 'exceeded' && <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {budget.category_name || 'Uncategorized'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="capitalize">{budget.period} Limit</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(budget.id)}
                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Delete budget"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Section */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between items-end text-sm">
                    <span className="text-gray-500 font-medium">Progress</span>
                    <span className="font-bold text-gray-900">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(budget.status)}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50">
                <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Spent</p>
                    <p className="text-lg font-bold text-gray-900">${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Remaining</p>
                    <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BudgetCard;
