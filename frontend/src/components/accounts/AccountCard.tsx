import React, { useState } from 'react';
import { Account, AccountType } from '@/types';
import {
    Wallet, CreditCard, PiggyBank, Banknote,
    MoreVertical, Edit2, Trash2, Copy, TrendingUp, DollarSign,
    ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface AccountCardProps {
    account: Account;
    onEdit: (account: Account) => void;
    onDelete: (id: number) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getAccountConfig = (type: AccountType) => {
        switch (type) {
            case AccountType.CHECKING:
                return {
                    icon: Wallet,
                    bg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
                    text: 'text-blue-50',
                    pattern: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)'
                };
            case AccountType.SAVINGS:
                return {
                    icon: PiggyBank,
                    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
                    text: 'text-emerald-50',
                    pattern: 'radial-gradient(circle at bottom left, rgba(255,255,255,0.15) 0%, transparent 50%)'
                };
            case AccountType.CREDIT:
                return {
                    icon: CreditCard,
                    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
                    text: 'text-slate-100',
                    pattern: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)'
                };
            case AccountType.INVESTMENT:
                return {
                    icon: TrendingUp,
                    bg: 'bg-gradient-to-br from-violet-600 to-fuchsia-700',
                    text: 'text-violet-50',
                    pattern: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                };
            case AccountType.LOAN:
                return {
                    icon: DollarSign,
                    bg: 'bg-gradient-to-br from-rose-600 to-red-800',
                    text: 'text-rose-50',
                    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)'
                };
            default:
                return {
                    icon: Banknote,
                    bg: 'bg-gradient-to-br from-gray-600 to-gray-800',
                    text: 'text-gray-50',
                    pattern: ''
                };
        }
    };

    const config = getAccountConfig(account.account_type);
    const Icon = config.icon;
    const balance = parseFloat(account.balance);
    const isNegative = balance < 0;



    return (
        <div className={`relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group ${config.text}`}>
            {/* Background & Pattern */}
            <div className={`absolute inset-0 ${config.bg}`}></div>
            <div className="absolute inset-0" style={{ background: config.pattern, backgroundSize: '20px 20px' }}></div>

            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

            <div className="relative p-6 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider opacity-80 backdrop-blur-sm px-1.5 py-0.5 rounded-md bg-black/10 inline-block">
                                {account.account_type.replace('_', ' ')}
                            </p>
                            <h3 className="font-bold text-lg leading-tight mt-0.5 text-white tracking-tight">{account.name}</h3>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            <MoreVertical className="w-5 h-5 text-white" />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-20 border border-white/20 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { onEdit(account); setIsMenuOpen(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4 text-blue-500" /> Edit Account
                                    </button>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(balance.toString()); setIsMenuOpen(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4 text-gray-500" /> Copy Balance
                                    </button>
                                    <div className="my-1 border-t border-gray-100" />
                                    <button
                                        onClick={() => { onDelete(account.id); setIsMenuOpen(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Balance Section */}
                <div className="mt-8">
                    <p className="text-sm font-medium opacity-80 mb-1">Total Balance</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-white shadow-sm">
                            {formatCurrency(balance, account.currency)}
                        </span>
                    </div>
                    {isNegative && (
                        <div className="flex items-center gap-1 mt-2 text-red-200 bg-red-900/30 px-2 py-1 rounded-lg w-fit text-xs font-semibold backdrop-blur-sm border border-red-500/20">
                            <ArrowDownLeft className="w-3 h-3" /> Overdrawn
                        </div>
                    )}
                    {!isNegative && (
                        <div className="flex items-center gap-1 mt-2 text-emerald-200 bg-emerald-900/30 px-2 py-1 rounded-lg w-fit text-xs font-semibold backdrop-blur-sm border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" /> Active
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs opacity-70 font-medium">
                    <span className="truncate max-w-[150px]">
                        {account.description || 'No description'}
                    </span>
                    <span>Last updated today</span>
                </div>
            </div>
        </div>
    );
};

export default AccountCard;
