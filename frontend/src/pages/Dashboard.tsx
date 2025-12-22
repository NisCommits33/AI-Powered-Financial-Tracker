import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import DashboardStats from '../components/dashboard/DashboardStats';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import ExportModal from '../components/transactions/ExportModal';
import ImportModal from '../components/transactions/ImportModal';
import { Download, Upload, RefreshCw, Calendar, ChevronRight } from 'lucide-react';
import {
    useGetDashboardOverviewQuery,
    useGetSpendingByCategoryQuery,
    useGetRecentTransactionsQuery,
    useGetMonthlyTrendsQuery
} from '../store/api/dashboardApi';
import {
    useExportTransactionsMutation,
    useImportTransactionsMutation
} from '../store/api/transactionsApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/format';

const Dashboard: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const currency = user?.currency || 'USD';

    // API Hooks
    const {
        data: stats,
        refetch: refetchStats,
        isFetching: isStatsFetching
    } = useGetDashboardOverviewQuery();

    const {
        data: spending,
        refetch: refetchSpending
    } = useGetSpendingByCategoryQuery();

    const [exportTransactions] = useExportTransactionsMutation();
    const [importTransactions] = useImportTransactionsMutation();

    const { data: recentTransactions } = useGetRecentTransactionsQuery(5);
    const { data: monthlyTrends } = useGetMonthlyTrendsQuery();

    // Handlers
    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const blob = await exportTransactions(format).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export transactions. Please try again.');
        }
    };

    const handleImport = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            await importTransactions(formData).unwrap();
            // Refresh data after successful import
            refetchStats();
            refetchSpending();
            setIsImportModalOpen(false);
            alert('Transactions imported successfully!');
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import transactions. Please check the file format.');
        }
    };

    const handleRefresh = () => {
        refetchStats();
        refetchSpending();
    };

    // Default empty values if data is missing
    const dashboardStats = stats || {
        total_balance: 0,
        monthly_income: 0,
        monthly_expenses: 0,
        account_count: 0,
        net_monthly: 0
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span>{currentDate}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Welcome back, <span className="text-blue-600">{user?.full_name || 'User'}</span>
                            </h1>
                            <p className="text-gray-500 mt-1">Here's what's happening with your finance today.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                className="p-2.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-5 h-5 ${isStatsFetching ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Upload className="w-4 h-4 mr-2 text-gray-500" />
                                Import
                            </button>
                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-lg transition-all"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Payload
                            </button>
                        </div>
                    </div>

                    {/* Content Space */}
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Section */}
                        <section>
                            <DashboardStats
                                totalBalance={dashboardStats.total_balance}
                                monthlyIncome={dashboardStats.monthly_income}
                                monthlyExpenses={dashboardStats.monthly_expenses}
                                currency={currency}
                            />
                        </section>

                        {/* Main Grid: Analytics & Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Analytics (2/3 width) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Spending Analysis</h3>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                                            View Report <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                    <AnalyticsDashboard
                                        spendingByCategory={spending || []}
                                        monthlyTrends={monthlyTrends || []}
                                        currency={currency}
                                    />
                                </div>
                            </div>

                            {/* Recent Transactions / Quick Overview (1/3 width) */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>
                                    </div>

                                    <div className="space-y-4">
                                        {recentTransactions?.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${tx.transaction_type === 'income' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                                                        }`}>
                                                        <span className="text-xs font-bold">
                                                            {tx.transaction_type === 'income' ? 'IN' : 'EXP'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{tx.description}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(tx.transaction_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${tx.transaction_type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                                                    }`}>
                                                    {tx.transaction_type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount), currency)}
                                                </span>
                                            </div>
                                        )) || (
                                                <div className="text-center py-8 text-gray-400">
                                                    No recent transactions
                                                </div>
                                            )}

                                        <div className="pt-4 border-t border-gray-50 flex justify-center">
                                            <p className="text-xs text-gray-400">Showing last 5 transactions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    onExport={handleExport}
                />
                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImport}
                />
            </div>
        </>
    );
};

export default Dashboard;
