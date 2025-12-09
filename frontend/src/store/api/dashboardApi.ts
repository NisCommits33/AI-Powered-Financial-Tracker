import { baseApi } from './baseApi';
import type { DashboardOverview, CategorySpending, Account, Transaction } from '@/types';

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardOverview: builder.query<DashboardOverview, void>({
            query: () => '/dashboard/overview',
            providesTags: ['Dashboard'],
        }),
        getRecentTransactions: builder.query<Transaction[], number | void>({
            query: (limit = 10) => `/dashboard/recent-transactions?limit=${limit}`,
            providesTags: ['Dashboard'],
        }),
        getSpendingByCategory: builder.query<CategorySpending[], void>({
            query: () => '/dashboard/spending-by-category',
            providesTags: ['Dashboard'],
        }),
        getAccountsSummary: builder.query<Account[], void>({
            query: () => '/dashboard/accounts-summary',
            providesTags: ['Dashboard'],
        }),
    }),
});

export const {
    useGetDashboardOverviewQuery,
    useGetRecentTransactionsQuery,
    useGetSpendingByCategoryQuery,
    useGetAccountsSummaryQuery,
} = dashboardApi;
