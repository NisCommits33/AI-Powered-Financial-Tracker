import { baseApi } from './baseApi';
import type { User, LoginCredentials, RegisterData, AuthResponse, UserUpdate } from '@/types';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<User, RegisterData>({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data,
            }),
        }),
        getCurrentUser: builder.query<User, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
        refreshToken: builder.mutation<AuthResponse, { refresh_token: string }>({
            query: (data) => ({
                url: '/auth/refresh',
                method: 'POST',
                body: data,
            }),
        }),
        updateProfile: builder.mutation<User, UserUpdate>({
            query: (data) => ({
                url: '/auth/me',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useRefreshTokenMutation,
    useUpdateProfileMutation,
} = authApi;
