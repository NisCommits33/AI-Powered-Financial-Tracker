import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
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
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
                            <p className="mt-2 text-gray-600">Track your spending and stay within your budget</p>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Budget</span>
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
        </>
    );
};

export default Budgets;
