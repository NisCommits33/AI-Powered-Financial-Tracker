import React, { useState } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import ExportModal from '../components/transactions/ExportModal';
import ImportModal from '../components/transactions/ImportModal';
import { DownloadIcon, UploadIcon } from 'lucide-react';

// Mock Data for visualization until API is connected
const MOCK_STATS = {
    totalBalance: 12500.50,
    monthlyIncome: 4500.00,
    monthlyExpenses: 2100.00,
};

const MOCK_SPENDING = [
    { name: 'Food', value: 400, color: '#0088FE' },
    { name: 'Transport', value: 300, color: '#00C49F' },
    { name: 'Utilities', value: 200, color: '#FFBB28' },
    { name: 'Entertainment', value: 150, color: '#FF8042' },
];

const Dashboard: React.FC = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Handlers
    const handleExport = (format: 'json' | 'csv') => {
        console.log(`Exporting in ${format} format...`);
        // Logic to call API or trigger download would go here
        setIsExportModalOpen(false);
    };

    const handleImport = (file: File) => {
        console.log(`Importing file: ${file.name}`);
        // Logic to upload file would go here
        setIsImportModalOpen(false);
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
                        <DashboardStats {...MOCK_STATS} />
                    </section>

                    {/* Analytics Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnalyticsDashboard spendingByCategory={MOCK_SPENDING} monthlyTrends={[]} />
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
