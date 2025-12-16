import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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

    const { data: accounts, isLoading, refetch } = useGetAccountsQuery();
    const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
    const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
    const [deleteAccount] = useDeleteAccountMutation();

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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
                            <p className="mt-2 text-gray-600">Manage your financial accounts</p>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Account</span>
                        </button>
                    </div>

                    {/* Account List */}
                    <AccountList
                        accounts={accounts || []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />

                    {/* Account Form Modal */}
                    {isFormOpen && (
                        <AccountForm
                            account={editingAccount}
                            onSubmit={editingAccount ? handleUpdate : handleCreate}
                            onClose={handleFormClose}
                            isLoading={isCreating || isUpdating}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Accounts;
