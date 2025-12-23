import React from 'react';
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

import { CategorySpending } from '../../types';
import { formatCurrency } from '@/utils/format';

interface AnalyticsDashboardProps {
    spendingByCategory: CategorySpending[];
    monthlyTrends: any[];
    currency?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    spendingByCategory,
    monthlyTrends,
    currency = 'USD',
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Spending by Category</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={spendingByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="amount"
                            >
                                {spendingByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(31, 41, 55)', color: '#fff', border: 'none' }} itemStyle={{ color: '#fff' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Monthly Trends</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyTrends}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value, currency), undefined]}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgb(31, 41, 55)', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
