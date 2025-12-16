import React from 'react';
import { Account } from '@/types';
import AccountCard from './AccountCard';

interface AccountListProps {
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (accounts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No accounts found</p>
                <p className="text-gray-400 text-sm mt-2">Add your first account to get started</p>
            </div>
        );
    }

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

    return (
        <div>
            {/* Total Balance Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
                <h3 className="text-lg font-medium mb-2">Total Balance</h3>
                <p className="text-4xl font-bold">
                    ${totalBalance.toFixed(2)}
                </p>
                <p className="text-sm mt-2 opacity-90">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
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
