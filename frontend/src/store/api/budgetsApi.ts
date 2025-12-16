import { baseApi } from './baseApi';
import type { Budget, BudgetWithProgress, BudgetCreate } from '@/types';

export const budgetsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBudgets: builder.query<BudgetWithProgress[], void>({
            query: () => '/budgets',
            providesTags: ['Budget'],
        }),
        getBudget: builder.query<BudgetWithProgress, number>({
            query: (id) => `/budgets/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Budget', id }],
        }),
        createBudget: builder.mutation<Budget, BudgetCreate>({
            query: (data) => ({
                url: '/budgets',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Budget', 'Dashboard'],
        }),
        deleteBudget: builder.mutation<void, number>({
            query: (id) => ({
                url: `/budgets/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Budget', 'Dashboard'],
        }),
    }),
});

export const {
    useGetBudgetsQuery,
    useGetBudgetQuery,
    useCreateBudgetMutation,
    useDeleteBudgetMutation,
} = budgetsApi;
