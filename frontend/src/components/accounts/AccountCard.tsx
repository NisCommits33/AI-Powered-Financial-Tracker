import React from 'react';
import { Account, AccountType } from '@/types';
import { Wallet, CreditCard, PiggyBank, Banknote, Pencil, Trash2 } from 'lucide-react';

interface AccountCardProps {
    account: Account;
    onEdit: (account: Account) => void;
    onDelete: (id: number) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onDelete }) => {
    const getAccountIcon = (type: AccountType) => {
        switch (type) {
            case AccountType.CHECKING:
                return <Wallet className="w-8 h-8" />;
            case AccountType.SAVINGS:
                return <PiggyBank className="w-8 h-8" />;
            case AccountType.CREDIT:
                return <CreditCard className="w-8 h-8" />;
            case AccountType.CASH:
                return <Banknote className="w-8 h-8" />;
            default:
                return <Wallet className="w-8 h-8" />;
        }
    };

    const getAccountColor = (type: AccountType) => {
        switch (type) {
            case AccountType.CHECKING:
                return 'bg-blue-100 text-blue-600';
            case AccountType.SAVINGS:
                return 'bg-green-100 text-green-600';
            case AccountType.CREDIT:
                return 'bg-purple-100 text-purple-600';
            case AccountType.CASH:
                return 'bg-yellow-100 text-yellow-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const balance = parseFloat(account.balance);
    const isNegative = balance < 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getAccountColor(account.account_type)}`}>
                    {getAccountIcon(account.account_type)}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(account)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit account"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(account.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete account"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{account.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{account.account_type.replace('_', ' ')}</p>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Balance</p>
                <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                    {account.currency} {Math.abs(balance).toFixed(2)}
                    {isNegative && <span className="text-sm ml-1">(Overdrawn)</span>}
                </p>
            </div>

            {account.description && (
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{account.description}</p>
                </div>
            )}
        </div>
    );
};

export default AccountCard;
