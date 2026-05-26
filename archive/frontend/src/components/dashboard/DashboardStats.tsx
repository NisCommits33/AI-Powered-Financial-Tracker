import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, Wallet, TrendingUp } from 'lucide-react';



import { formatCurrency } from '@/utils/format';

interface DashboardStatsProps {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    currency?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    currency = 'USD',
}) => {

    const netSavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Balance - Premium Dark Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-6 shadow-xl text-white group hover:translate-y-[-2px] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="w-24 h-24 transform rotate-12" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                            <Wallet className="w-6 h-6 text-blue-300" />
                        </div>
                        <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Total Balance</span>
                    </div>

                    <h3 className="text-3xl font-bold tracking-tight mb-2">
                        {formatCurrency(totalBalance, currency)}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +2.5%
                        </span>
                        <span>vs last month</span>
                    </div>
                </div>
            </div>

            {/* Monthly Income - Bright Functional Card */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 group hover:border-emerald-100 dark:hover:border-emerald-900/50 transition-colors">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <ArrowUpIcon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Monthly Income</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {formatCurrency(monthlyIncome, currency)}
                    </h3>

                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>

            {/* Monthly Expenses - Alert/Control Card */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 group hover:border-rose-100 dark:hover:border-rose-900/50 transition-colors">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                                <ArrowDownIcon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Monthly Expenses</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {formatCurrency(monthlyExpenses, currency)}
                    </h3>

                    <div className="flex items-center justify-between mt-4 text-xs font-medium">
                        <span className="text-slate-500 dark:text-gray-400">Savings Rate</span>
                        <span className={`${savingsRate > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {savingsRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${savingsRate > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(savingsRate, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
