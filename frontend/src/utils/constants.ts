import { AccountType, TransactionType } from '@/types';

// Account types
export const ACCOUNT_TYPES = [
    { value: AccountType.CHECKING, label: 'Checking' },
    { value: AccountType.SAVINGS, label: 'Savings' },
    { value: AccountType.CREDIT, label: 'Credit Card' },
    { value: AccountType.CASH, label: 'Cash' },
];

// Transaction types
export const TRANSACTION_TYPES = [
    { value: TransactionType.INCOME, label: 'Income' },
    { value: TransactionType.EXPENSE, label: 'Expense' },
];

// Currency options
export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const API_DATE_FORMAT = 'yyyy-MM-dd';

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Local storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
} as const;
