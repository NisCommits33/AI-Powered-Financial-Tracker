import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
import Navbar from '@/components/layout/Navbar';
import {
    useGetBudgetsQuery,
    useCreateBudgetMutation,
    useDeleteBudgetMutation,
} from '@/store/api/budgetsApi';
import { BudgetCreate } from '@/types';

const Budgets: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: budgets, isLoading, refetch } = useGetBudgetsQuery();
    const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation();
    const [deleteBudget] = useDeleteBudgetMutation();

    const handleCreate = async (formData: BudgetCreate) => {
        try {
            await createBudget(formData).unwrap();
            setIsFormOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to create budget:', error);
            alert('Failed to create budget. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this budget?')) return;
        try {
            await deleteBudget(id).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to delete budget:', error);
            alert('Failed to delete budget. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    Budgets
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Track your spending and save more money.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl transition-all shadow-lg shadow-gray-200 dark:shadow-none font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Budget</span>
                            </button>
                        </div>

                        {/* Budget List */}
                        <BudgetList
                            budgets={budgets || []}
                            onDelete={handleDelete}
                            isLoading={isLoading}
                        />

                        {/* Budget Form Modal */}
                        {isFormOpen && (
                            <BudgetForm
                                onSubmit={handleCreate}
                                onClose={() => setIsFormOpen(false)}
                                isLoading={isCreating}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Budgets;
