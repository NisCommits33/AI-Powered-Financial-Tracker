import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from 'lucide-react';

interface DashboardStatsProps {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Total Balance */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <WalletIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Balance</dt>
                                <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalBalance)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Income */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ArrowUpIcon className="h-6 w-6 text-success-500" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                                <dd className="text-lg font-medium text-gray-900">{formatCurrency(monthlyIncome)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ArrowDownIcon className="h-6 w-6 text-danger-500" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                                <dd className="text-lg font-medium text-gray-900">{formatCurrency(monthlyExpenses)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
