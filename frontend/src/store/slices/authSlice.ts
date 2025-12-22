import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { authApi } from '@/store/api/authApi';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
    accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user?: User; accessToken?: string; refreshToken?: string }>
        ) => {
            const { user, accessToken, refreshToken } = action.payload;

            if (user) {
                state.user = user;
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            }

            if (accessToken) {
                state.accessToken = accessToken;
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                state.isAuthenticated = true;
            }

            if (refreshToken) {
                state.refreshToken = refreshToken;
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            }
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;

            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

            // Clear API state
            authApi.util.resetApiState();
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.getCurrentUser.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload;
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload));
                }
            )
            .addMatcher(
                authApi.endpoints.updateProfile.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload;
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload));
                }
            );
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
