import React, { useState } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import ExportModal from '../components/transactions/ExportModal';
import ImportModal from '../components/transactions/ImportModal';
import { DownloadIcon, UploadIcon, RefreshCwIcon } from 'lucide-react';
import {
    useGetDashboardOverviewQuery,
    useGetSpendingByCategoryQuery
} from '../store/api/dashboardApi';
import {
    useExportTransactionsMutation,
    useImportTransactionsMutation
} from '../store/api/transactionsApi';

const Dashboard: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // API Hooks
    const {
        data: stats,
        isLoading: isStatsLoading,
        refetch: refetchStats
    } = useGetDashboardOverviewQuery();

    const {
        data: spending,
        isLoading: isSpendingLoading,
        refetch: refetchSpending
    } = useGetSpendingByCategoryQuery();

    const [exportTransactions] = useExportTransactionsMutation();
    const [importTransactions] = useImportTransactionsMutation();

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

    if (isStatsLoading || isSpendingLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Default empty values if data is missing
    const dashboardStats = stats || {
        total_balance: 0,
        monthly_income: 0,
        monthly_expenses: 0,
        account_count: 0,
        net_monthly: 0
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Financial Dashboard
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={handleRefresh}
                        >
                            <RefreshCwIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => setIsImportModalOpen(true)}
                        >
                            <UploadIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                            Import
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => setIsExportModalOpen(true)}
                        >
                            <DownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Export
                        </button>
                    </div>
                </div>

                {/* content */}
                <div className="space-y-8">
                    {/* Stats Section */}
                    <section>
                        <DashboardStats
                            totalBalance={dashboardStats.total_balance}
                            monthlyIncome={dashboardStats.monthly_income}
                            monthlyExpenses={dashboardStats.monthly_expenses}
                        />
                    </section>

                    {/* Analytics Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnalyticsDashboard
                            spendingByCategory={spending || []}
                            monthlyTrends={[]}
                        />
                        {/* Placeholder for Recent Transactions List */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                            <p className="text-gray-500 text-sm">Transaction list component coming here.</p>
                        </div>
                    </section>
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
    );
};

export default Dashboard;
