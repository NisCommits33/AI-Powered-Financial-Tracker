import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    full_name: z.string().min(1, 'Full name is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Account validation schemas
export const accountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    account_type: z.enum(['checking', 'savings', 'credit', 'cash']),
    balance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').optional(),
    currency: z.string().length(3).optional(),
    description: z.string().max(500).optional(),
});

// Transaction validation schemas
export const transactionSchema = z.object({
    amount: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
        .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
    transaction_type: z.enum(['income', 'expense']),
    description: z.string().min(1, 'Description is required').max(255),
    transaction_date: z.string().min(1, 'Date is required'),
    notes: z.string().max(1000).optional(),
    category_id: z.number().optional(),
    account_id: z.number().min(1, 'Account is required'),
});

// Category validation schemas
export const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50),
    description: z.string().max(200).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
