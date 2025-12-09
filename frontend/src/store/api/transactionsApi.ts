import { baseApi } from './baseApi';
import type {
    Transaction,
    TransactionWithDetails,
    TransactionCreate,
    TransactionFilters,
    PaginatedResponse,
} from '@/types';

interface TransactionQueryParams extends TransactionFilters {
    page?: number;
    size?: number;
}

export const transactionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTransactions: builder.query<PaginatedResponse<TransactionWithDetails>, TransactionQueryParams>({
            query: (params) => ({
                url: '/transactions',
                params,
            }),
            providesTags: ['Transaction'],
        }),
        getTransaction: builder.query<Transaction, number>({
            query: (id) => `/transactions/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
        }),
        createTransaction: builder.mutation<Transaction, TransactionCreate>({
            query: (data) => ({
                url: '/transactions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Transaction', 'Account', 'Dashboard'],
        }),
        updateTransaction: builder.mutation<Transaction, { id: number; data: Partial<TransactionCreate> }>({
            query: ({ id, data }) => ({
                url: `/transactions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Transaction', id },
                'Transaction',
                'Account',
                'Dashboard',
            ],
        }),
        deleteTransaction: builder.mutation<void, number>({
            query: (id) => ({
                url: `/transactions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Transaction', 'Account', 'Dashboard'],
        }),
    }),
});

export const {
    useGetTransactionsQuery,
    useGetTransactionQuery,
    useCreateTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
} = transactionsApi;
