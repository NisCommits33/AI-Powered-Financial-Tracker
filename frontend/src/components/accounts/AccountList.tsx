import React from 'react';
import { Account } from '@/types';
import AccountCard from './AccountCard';
import { Plus } from 'lucide-react';

interface AccountListProps {
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-3xl bg-gray-100 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 animate-[shimmer_2s_infinite]"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No accounts yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                    Add your first account to start tracking your financial health and visualizing your wealth.
                </p>
            </div>
        );
    }

    // Calculate total balance for summary (optional, can be removed if handled in parent)
    const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

    return (
        <div>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Your Accounts</h2>
                <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    Total: <span className="text-gray-900">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Account Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default AccountList;
