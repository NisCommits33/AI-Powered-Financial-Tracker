import React, { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, Filter, Search, RefreshCw, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AccountList from '@/components/accounts/AccountList';
import AccountForm from '@/components/accounts/AccountForm';
import {
    useGetAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
} from '@/store/api/accountsApi';
import { AccountCreate, Account } from '@/types';

const Accounts: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showHiddenStats, setShowHiddenStats] = useState(false);

    const { data: accounts, isLoading, refetch, isFetching } = useGetAccountsQuery();
    const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
    const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
    const [deleteAccount] = useDeleteAccountMutation();

    // Calculate comprehensive metrics
    const accountMetrics = useMemo(() => {
        if (!accounts) return {
            total: 0,
            active: 0,
            totalAssets: 0,
            totalLiabilities: 0,
            netWorth: 0
        };

        const total = accounts.length;
        const active = accounts.filter(acc => acc.is_active).length;

        const assetAccounts = accounts.filter(a => !['credit', 'loan'].includes(a.account_type));
        const liabilityAccounts = accounts.filter(a => ['credit', 'loan'].includes(a.account_type));

        const totalAssets = assetAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
        const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
        const netWorth = totalAssets - Math.abs(totalLiabilities);

        return { total, active, totalAssets, totalLiabilities, netWorth };
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        if (!accounts) return [];

        return accounts.filter(account => {
            const matchesSearch = searchTerm === '' ||
                account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.account_type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterType === 'all' || account.account_type === filterType;

            return matchesSearch && matchesFilter;
        });
    }, [accounts, searchTerm, filterType]);

    const handleCreate = async (formData: AccountCreate) => {
        try {
            await createAccount(formData).unwrap();
            setIsFormOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to create account:', error);
            alert('Failed to create account. Please try again.');
        }
    };

    const handleUpdate = async (formData: AccountCreate) => {
        if (!editingAccount) return;
        try {
            await updateAccount({ id: editingAccount.id, data: formData }).unwrap();
            setEditingAccount(undefined);
            setIsFormOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to update account:', error);
            alert('Failed to update account. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
        try {
            await deleteAccount(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account. Please try again.');
        }
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAccount(undefined);
    };

    const accountTypes = [
        { value: 'all', label: 'All Accounts' },
        { value: 'checking', label: 'Checking' },
        { value: 'savings', label: 'Savings' },
        { value: 'credit', label: 'Credit Cards' },
        { value: 'investment', label: 'Investments' },
        { value: 'loan', label: 'Loans' },
        { value: 'cash', label: 'Cash' },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
                            <p className="text-gray-500 mt-1">Track your wealth and manage accounts</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => refetch()}
                                className="p-2.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Account
                            </button>
                        </div>
                    </div>

                    {/* Financial Health Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Net Worth Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl text-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp className="w-24 h-24 transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                        <Wallet className="w-6 h-6 text-blue-300" />
                                    </div>
                                    <button
                                        onClick={() => setShowHiddenStats(!showHiddenStats)}
                                        className="text-white/50 hover:text-white transition-colors"
                                    >
                                        {showHiddenStats ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Net Worth</p>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    {showHiddenStats ? '••••••' : `$${accountMetrics.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                </h2>
                                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <span className="bg-white/10 px-2 py-1 rounded-lg text-blue-200">
                                        {accountMetrics.active} Active Accounts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Assets Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-colors">
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Assets</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {showHiddenStats ? '••••••' : `$${accountMetrics.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                </h2>
                                <p className="text-sm text-gray-500">Across investment & savings</p>
                            </div>
                        </div>

                        {/* Liabilities Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-red-100 transition-colors">
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                                        <ArrowDownRight className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Liabilities</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {showHiddenStats ? '••••••' : `$${Math.abs(accountMetrics.totalLiabilities).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                </h2>
                                <p className="text-sm text-gray-500">Credit cards & loans</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by account name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                                <div className="flex items-center px-3 text-gray-400">
                                    <Filter className="w-5 h-5" />
                                </div>
                                {accountTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setFilterType(type.value)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterType === type.value
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Account List */}
                    <AccountList
                        accounts={filteredAccounts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Account Form Modal */}
            {isFormOpen && (
                <AccountForm
                    account={editingAccount}
                    onSubmit={editingAccount ? handleUpdate : handleCreate}
                    onClose={handleFormClose}
                    isLoading={isCreating || isUpdating}
                />
            )}
        </>
    );
};

export default Accounts;
