export interface Account {
  id: string
  name: string
  account_type: 'checking' | 'savings' | 'credit' | 'cash'
  balance: number
  currency: string
  description?: string
}

export interface Category {
  id: string
  name: string
  color: string
  description?: string
}

export interface Budget {
  id: string
  name: string
  month: string
  total_amount: number
}

export interface BudgetCategory {
  id: string
  budget_id: string
  category_id: string
  allocated_amount: number
  spent_amount: number
}

export interface Transaction {
  id: string
  amount: number
  transaction_type: 'income' | 'expense'
  description: string
  transaction_date: string
  category_id?: string
  account_id: string
}

export const seedAccounts: Account[] = [
  {
    id: 'acc-chase-checking',
    name: 'Chase Checking',
    account_type: 'checking',
    balance: 5230.50,
    currency: 'USD',
    description: 'Primary checking account for direct deposits and bill payments'
  },
  {
    id: 'acc-ally-savings',
    name: 'Ally Savings',
    account_type: 'savings',
    balance: 18450.00,
    currency: 'USD',
    description: 'Emergency fund and high-yield savings'
  },
  {
    id: 'acc-sapphire-credit',
    name: 'Sapphire Credit Card',
    account_type: 'credit',
    balance: -340.20,
    currency: 'USD',
    description: 'Travel and dining reward credit card'
  },
  {
    id: 'acc-cash-wallet',
    name: 'Cash Wallet',
    account_type: 'cash',
    balance: 120.00,
    currency: 'USD',
    description: 'Physical cash for daily minor expenses'
  }
]

export const seedCategories: Category[] = [
  { id: 'cat-housing', name: 'Housing', color: '#3b82f6', description: 'Rent, mortgage, repairs, and home maintenance' },
  { id: 'cat-utilities', name: 'Utilities', color: '#f59e0b', description: 'Electricity, water, gas, internet, and phone bills' },
  { id: 'cat-food', name: 'Food & Dining', color: '#ef4444', description: 'Groceries, restaurants, fast food, and coffee' },
  { id: 'cat-transport', name: 'Transportation', color: '#10b981', description: 'Fuel, public transit, taxi, vehicle servicing, and parking' },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#8b5cf6', description: 'Movies, music, streaming, concerts, and games' },
  { id: 'cat-shopping', name: 'Shopping', color: '#ec4899', description: 'Clothes, electronics, hobbies, and general merchandise' },
  { id: 'cat-healthcare', name: 'Healthcare', color: '#14b8a6', description: 'Medicines, doctor visits, health insurance, and dental' },
  { id: 'cat-savings', name: 'Savings & Investment', color: '#06b6d4', description: 'Transfers to savings, stocks, and crypto' },
  { id: 'cat-salary', name: 'Salary', color: '#22c55e', description: 'Primary employment income' },
  { id: 'cat-investments', name: 'Investments', color: '#84cc16', description: 'Dividends, capital gains, and investment returns' },
  { id: 'cat-other-income', name: 'Other Income', color: '#a855f7', description: 'Gifts, refunds, and miscellaneous side hustles' }
]

// Generate dates dynamically so they are always in the current month/year
const now = new Date()
const currentYear = now.getFullYear()
const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0')
const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15)
const lastMonthYear = lastMonthDate.getFullYear()
const lastMonthStr = String(lastMonthDate.getMonth() + 1).padStart(2, '0')

export const seedBudgets: Budget[] = [
  {
    id: 'budget-current-month',
    name: 'Primary Monthly Budget',
    month: `${currentYear}-${currentMonthStr}-01`,
    total_amount: 2500.00
  }
]

export const seedBudgetCategories: BudgetCategory[] = [
  {
    id: 'bc-1',
    budget_id: 'budget-current-month',
    category_id: 'cat-food',
    allocated_amount: 500.00,
    spent_amount: 205.90
  },
  {
    id: 'bc-2',
    budget_id: 'budget-current-month',
    category_id: 'cat-entertainment',
    allocated_amount: 200.00,
    spent_amount: 15.99
  },
  {
    id: 'bc-3',
    budget_id: 'budget-current-month',
    category_id: 'cat-utilities',
    allocated_amount: 300.00,
    spent_amount: 112.50
  },
  {
    id: 'bc-4',
    budget_id: 'budget-current-month',
    category_id: 'cat-transport',
    allocated_amount: 150.00,
    spent_amount: 45.00
  }
]

export const seedTransactions: Transaction[] = [
  {
    id: 'tx-1',
    amount: 3200.00,
    transaction_type: 'income',
    description: 'Monthly Paycheck Acme Corp',
    transaction_date: `${currentYear}-${currentMonthStr}-01`,
    category_id: 'cat-salary',
    account_id: 'acc-chase-checking'
  },
  {
    id: 'tx-2',
    amount: 120.40,
    transaction_type: 'expense',
    description: 'Whole Foods Market',
    transaction_date: `${currentYear}-${currentMonthStr}-05`,
    category_id: 'cat-food',
    account_id: 'acc-sapphire-credit'
  },
  {
    id: 'tx-3',
    amount: 45.00,
    transaction_type: 'expense',
    description: 'Shell Gas Station',
    transaction_date: `${currentYear}-${currentMonthStr}-07`,
    category_id: 'cat-transport',
    account_id: 'acc-sapphire-credit'
  },
  {
    id: 'tx-4',
    amount: 15.99,
    transaction_type: 'expense',
    description: 'Netflix Subscription',
    transaction_date: `${currentYear}-${currentMonthStr}-10`,
    category_id: 'cat-entertainment',
    account_id: 'acc-chase-checking'
  },
  {
    id: 'tx-5',
    amount: 112.50,
    transaction_type: 'expense',
    description: 'Electric Bill Power Co',
    transaction_date: `${currentYear}-${currentMonthStr}-12`,
    category_id: 'cat-utilities',
    account_id: 'acc-ally-savings'
  },
  {
    id: 'tx-6',
    amount: 85.50,
    transaction_type: 'expense',
    description: 'Le Bistro Dinner',
    transaction_date: `${currentYear}-${currentMonthStr}-15`,
    category_id: 'cat-food',
    account_id: 'acc-cash-wallet'
  },
  // Last month transactions for timeline chart
  {
    id: 'tx-7',
    amount: 3200.00,
    transaction_type: 'income',
    description: 'Monthly Paycheck Acme Corp',
    transaction_date: `${lastMonthYear}-${lastMonthStr}-01`,
    category_id: 'cat-salary',
    account_id: 'acc-chase-checking'
  },
  {
    id: 'tx-8',
    amount: 180.50,
    transaction_type: 'expense',
    description: 'Costco Wholesale',
    transaction_date: `${lastMonthYear}-${lastMonthStr}-04`,
    category_id: 'cat-food',
    account_id: 'acc-chase-checking'
  },
  {
    id: 'tx-9',
    amount: 112.50,
    transaction_type: 'expense',
    description: 'Electric Bill Power Co',
    transaction_date: `${lastMonthYear}-${lastMonthStr}-11`,
    category_id: 'cat-utilities',
    account_id: 'acc-ally-savings'
  }
]
