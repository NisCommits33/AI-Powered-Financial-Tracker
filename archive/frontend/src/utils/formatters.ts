import { format, parseISO } from 'date-fns';
import { DATE_FORMAT, API_DATE_FORMAT } from './constants';

/**
 * Format currency value
 */
export const formatCurrency = (amount: number | string, currency = 'USD'): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
};

/**
 * Format number with commas
 */
export const formatNumber = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(numValue);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = parseISO(dateString);
        return format(date, DATE_FORMAT);
    } catch (error) {
        return dateString;
    }
};

/**
 * Format date for API
 */
export const formatDateForAPI = (date: Date): string => {
    return format(date, API_DATE_FORMAT);
};

/**
 * Parse date from API format
 */
export const parseDateFromAPI = (dateString: string): Date => {
    return parseISO(dateString);
};

/**
 * Get account type label
 */
export const getAccountTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        checking: 'Checking',
        savings: 'Savings',
        credit: 'Credit Card',
        cash: 'Cash',
    };
    return labels[type] || type;
};

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: string): string => {
    return type === 'income' ? 'text-success-600' : 'text-danger-600';
};

/**
 * Get transaction type badge
 */
export const getTransactionTypeBadge = (type: string): string => {
    return type === 'income' ? 'badge-success' : 'badge-danger';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};
