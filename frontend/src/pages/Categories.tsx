import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/store/api/categoriesApi';
import { Category, CategoryCreate } from '@/types';
import CategoryForm from '@/components/categories/CategoryForm';
import { Plus, Tag, Pencil, Trash2, Search } from 'lucide-react';

const Categories: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: categories, isLoading } = useGetCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const handleCreateOrUpdate = async (data: CategoryCreate) => {
        try {
            if (editingCategory) {
                await updateCategory({
                    id: editingCategory.id,
                    data
                }).unwrap();
            } else {
                await createCategory(data).unwrap();
            }
            setIsFormOpen(false);
            setEditingCategory(undefined);
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category. Please try a different name.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category? Transactions associated with it will be preserved but uncategorized.')) {
            try {
                await deleteCategory(id).unwrap();
            } catch (error) {
                console.error('Failed to delete category:', error);
                alert('Failed to delete category. It might be in use or a default category.');
            }
        }
    };

    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-12 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                Categories
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Organize your transactions with custom categories.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingCategory(undefined);
                                setIsFormOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl shadow-lg transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-8 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCategories?.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: category.color || '#e5e7eb' }} />

                                    <div className="flex justify-between items-start pl-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400">
                                                <Tag className="w-5 h-5" style={{ color: category.color || 'inherit' }} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.name}</h3>
                                                {category.is_default && (
                                                    <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {!category.is_default && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 pl-4 min-h-[40px]">
                                        {category.description || 'No description provided.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredCategories?.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No categories found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try modifying your search or add a new category.
                            </p>
                        </div>
                    )}

                    {/* Modal */}
                    {isFormOpen && (
                        <CategoryForm
                            category={editingCategory}
                            onSubmit={handleCreateOrUpdate}
                            onClose={() => {
                                setIsFormOpen(false);
                                setEditingCategory(undefined);
                            }}
                            isLoading={isCreating || isUpdating}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Categories;
