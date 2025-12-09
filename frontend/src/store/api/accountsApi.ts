import { baseApi } from './baseApi';
import type { Account, AccountCreate } from '@/types';

export const accountsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAccounts: builder.query<Account[], void>({
            query: () => '/accounts',
            providesTags: ['Account'],
        }),
        getAccount: builder.query<Account, number>({
            query: (id) => `/accounts/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Account', id }],
        }),
        createAccount: builder.mutation<Account, AccountCreate>({
            query: (data) => ({
                url: '/accounts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Account', 'Dashboard'],
        }),
        updateAccount: builder.mutation<Account, { id: number; data: Partial<AccountCreate> }>({
            query: ({ id, data }) => ({
                url: `/accounts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Account', id }, 'Dashboard'],
        }),
        deleteAccount: builder.mutation<void, number>({
            query: (id) => ({
                url: `/accounts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Account', 'Dashboard'],
        }),
    }),
});

export const {
    useGetAccountsQuery,
    useGetAccountQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
} = accountsApi;
