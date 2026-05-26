-- ==========================================
-- AI-Powered Financial Tracker - Supabase SQL Schema
-- ==========================================
-- Copy and paste this script directly into the Supabase SQL Editor.
-- This script sets up tables, foreign keys, constraints, triggers, 
-- and seeds the initial categories.

-- 1. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit', 'cash')),
    balance NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform CRUD on their own accounts"
    ON public.accounts FOR ALL
    USING (auth.uid() = user_id);

-- 3. Categories Table (global defaults & optional custom)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Categories (Readable by all authenticated users, writable only by system admin)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by authenticated users"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount NUMERIC(12,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform CRUD on their own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    month DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform CRUD on their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id);

-- 6. Budget Categories Table (allocations per budget)
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    allocated_amount NUMERIC(12,2) NOT NULL,
    spent_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Budget Categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform CRUD on their own budget categories"
    ON public.budget_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            WHERE b.id = budget_id AND b.user_id = auth.uid()
        )
    );

-- ==========================================
-- Triggers for Automation & Safety
-- ==========================================

-- Trigger to automatically create a public profile when a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, currency)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(new.raw_user_meta_data->>'currency', 'USD')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp across tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Initial Categories Seeding
-- ==========================================
INSERT INTO public.categories (name, description, icon, color, is_default) VALUES
('Housing', 'Rent, mortgage, repairs, and home maintenance', 'home', '#3b82f6', true),
('Utilities', 'Electricity, water, gas, internet, and phone bills', 'zap', '#f59e0b', true),
('Food & Dining', 'Groceries, restaurants, fast food, and coffee', 'utensils', '#ef4444', true),
('Transportation', 'Fuel, public transit, taxi, vehicle servicing, and parking', 'car', '#10b981', true),
('Entertainment', 'Movies, music, streaming, concerts, and games', 'film', '#8b5cf6', true),
('Shopping', 'Clothes, electronics, hobbies, and general merchandise', 'shopping-bag', '#ec4899', true),
('Healthcare', 'Medicines, doctor visits, health insurance, and dental', 'heart-pulse', '#14b8a6', true),
('Savings & Investment', 'Transfers to savings, stocks, and crypto', 'trending-up', '#06b6d4', true),
('Salary', 'Primary employment income', 'briefcase', '#22c55e', true),
('Investments', 'Dividends, capital gains, and investment returns', 'dollar-sign', '#84cc16', true),
('Other Income', 'Gifts, refunds, and miscellaneous side hustles', 'gift', '#a855f7', true)
ON CONFLICT (name) DO NOTHING;
