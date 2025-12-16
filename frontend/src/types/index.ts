// User types
export interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

// Account types
export enum AccountType {
    CHECKING = 'checking',
    SAVINGS = 'savings',
    CREDIT = 'credit',
    CASH = 'cash',
}

export interface Account {
    id: number;
    name: string;
    account_type: AccountType;
    balance: string;
    currency: string;
    description?: string;
    is_active: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface AccountCreate {
    name: string;
    account_type: AccountType;
    balance?: string;
    currency?: string;
    description?: string;
}

// Transaction types
export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export interface Transaction {
    id: number;
    amount: string;
    transaction_type: TransactionType;
    description: string;
    transaction_date: string;
    notes?: string;
    category_id?: number;
    account_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
    account_name?: string;
    category_name?: string;
}

export interface TransactionCreate {
    amount: string;
    transaction_type: TransactionType;
    description: string;
    transaction_date: string;
    notes?: string;
    category_id?: number;
    account_id: number;
}

export interface TransactionFilters {
    start_date?: string;
    end_date?: string;
    transaction_type?: TransactionType;
    category_id?: number;
    account_id?: number;
    min_amount?: string;
    max_amount?: string;
    search?: string;
}

// Category types
export interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    is_default: boolean;
    created_at: string;
}

export interface CategoryCreate {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

// Dashboard types
export interface DashboardOverview {
    total_balance: number;
    monthly_income: number;
    monthly_expenses: number;
    net_monthly: number;
    account_count: number;
}

export interface CategorySpending {
    category_id: number;
    category_name: string;
    color?: string;
    amount: number;
}

// Pagination types
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

// Budget types
export interface Budget {
    id: number;
    user_id: number;
    category_id: number;
    category_name?: string;
    amount: string;
    period: string;
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface BudgetWithProgress extends Budget {
    spent: string;
    remaining: string;
    percentage: number;
    status: 'on_track' | 'warning' | 'exceeded';
}

export interface BudgetCreate {
    category_id: number;
    amount: string;
    period: string;
    start_date: string;
    end_date?: string;
}

// API Error
export interface APIError {
    detail: string;
    error_code?: string;
}
