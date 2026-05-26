import { createBrowserClient } from '@supabase/ssr'
import { seedAccounts, seedCategories, seedTransactions, seedBudgets, seedBudgetCategories } from '@/data/seedData'

// Helpers for localStorage mock storage
function getLocalData(table: string) {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(`finance_tracker_${table}`)
  if (!data) {
    let initial: any[] = []
    if (table === 'accounts') initial = seedAccounts
    else if (table === 'categories') initial = seedCategories
    else if (table === 'transactions') initial = seedTransactions
    else if (table === 'budgets') initial = seedBudgets
    else if (table === 'budget_categories') initial = seedBudgetCategories
    localStorage.setItem(`finance_tracker_${table}`, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(data)
}

function saveLocalData(table: string, data: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`finance_tracker_${table}`, JSON.stringify(data))
}

function getLocalProfile() {
  if (typeof window === 'undefined') return { full_name: 'Demo Member', currency: 'USD' }
  const profile = localStorage.getItem('finance_tracker_profile')
  if (!profile) {
    const initial = { full_name: 'Demo Member', currency: 'USD' }
    localStorage.setItem('finance_tracker_profile', JSON.stringify(initial))
    return initial
  }
  return JSON.parse(profile)
}

function saveLocalProfile(profile: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('finance_tracker_profile', JSON.stringify(profile))
}

// Chainable mock builder mimicking Supabase syntax
class MockQueryBuilder {
  private table: string
  private data: any[] = []
  private isSingle = false

  constructor(table: string) {
    this.table = table
    if (table === 'profiles') {
      this.data = [getLocalProfile()]
    } else {
      this.data = getLocalData(table)
    }
  }

  select(columns?: string) {
    if (this.table === 'transactions') {
      const categories = getLocalData('categories')
      const accounts = getLocalData('accounts')
      this.data = this.data.map((tx: any) => ({
        ...tx,
        categories: categories.find((c: any) => c.id === tx.category_id) || tx.categories || { name: 'Uncategorized', color: '#64748b' },
        accounts: accounts.find((a: any) => a.id === tx.account_id) || tx.accounts || { name: 'N/A' }
      }))
    } else if (this.table === 'budgets') {
      const budgetCategories = getLocalData('budget_categories')
      const categories = getLocalData('categories')
      this.data = this.data.map((b: any) => {
        const bCats = budgetCategories.filter((bc: any) => bc.budget_id === b.id)
        const mappedBCats = bCats.map((bc: any) => ({
          ...bc,
          categories: categories.find((c: any) => c.id === bc.category_id) || { name: 'Unknown', color: '#64748b' }
        }))
        return {
          ...b,
          budget_categories: mappedBCats
        }
      })
    } else if (this.table === 'budget_categories') {
      const categories = getLocalData('categories')
      this.data = this.data.map((bc: any) => ({
        ...bc,
        categories: categories.find((c: any) => c.id === bc.category_id) || bc.categories
      }))
    }
    return this
  }

  eq(column: string, value: any) {
    if (column === 'transaction_type' || column === 'category_id' || column === 'id' || column === 'budget_id') {
      this.data = this.data.filter((item: any) => item[column] === value)
    }
    return this
  }

  gte(column: string, value: any) {
    if (column === 'transaction_date') {
      this.data = this.data.filter((item: any) => item[column] >= value)
    }
    return this
  }

  lte(column: string, value: any) {
    if (column === 'transaction_date') {
      this.data = this.data.filter((item: any) => item[column] <= value)
    }
    return this
  }

  order(column: string, { ascending = true } = {}) {
    this.data.sort((a: any, b: any) => {
      const valA = a[column]
      const valB = b[column]
      if (typeof valA === 'string') {
        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return ascending ? valA - valB : valB - valA
    })
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  limit(n: number) {
    this.data = this.data.slice(0, n)
    return this
  }

  // To resolve the promise seamlessly in await expressions
  then(onfulfilled: any) {
    const result = this.isSingle ? (this.data[0] || null) : this.data
    return Promise.resolve({ data: result, error: null }).then(onfulfilled)
  }

  insert(item: any) {
    if (Array.isArray(item)) {
      const newItems = item.map((subItem: any) => ({
        id: `mock-${this.table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...subItem,
        created_at: new Date().toISOString()
      }))
      const current = getLocalData(this.table)
      current.push(...newItems)
      saveLocalData(this.table, current)
      this.data = newItems
    } else {
      const newItem = {
        id: `mock-${this.table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        created_at: new Date().toISOString()
      }
      
      if (this.table === 'profiles') {
        saveLocalProfile(newItem)
      } else {
        const current = getLocalData(this.table)
        current.push(newItem)
        saveLocalData(this.table, current)
      }

      this.data = [newItem]
    }
    return this
  }

  update(updateData: any) {
    if (this.table === 'profiles') {
      const current = getLocalProfile()
      const updated = { ...current, ...updateData }
      saveLocalProfile(updated)
      this.data = [updated]
    } else {
      const current = getLocalData(this.table)
      const filteredIds = this.data.map((item: any) => item.id)
      const updated = current.map((item: any) => {
        if (filteredIds.includes(item.id)) {
          return { ...item, ...updateData }
        }
        return item
      })
      saveLocalData(this.table, updated)
      this.data = this.data.map((item: any) => ({ ...item, ...updateData }))
    }
    return this
  }

  delete() {
    if (this.table !== 'profiles') {
      const current = getLocalData(this.table)
      const filteredIds = this.data.map((item: any) => item.id)
      const remaining = current.filter((item: any) => !filteredIds.includes(item.id))
      saveLocalData(this.table, remaining)
    }
    this.data = []
    return this
  }
}

// Complete mock client
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: { id: 'demo-user', email: 'demo@finance.com' } }, error: null }),
    getSession: async () => ({ data: { session: {} }, error: null }),
    signInWithPassword: async (credentials: any) => {
      document.cookie = 'demo_mode=true; path=/; max-age=31536000'
      // Seed initial name based on email prefix
      const name = credentials.email.split('@')[0]
      saveLocalProfile({
        full_name: name.charAt(0).toUpperCase() + name.slice(1) + ' (Demo)',
        currency: 'USD'
      })
      return { data: { user: { id: 'demo-user', email: credentials.email } }, error: null }
    },
    signUp: async (credentials: any) => {
      document.cookie = 'demo_mode=true; path=/; max-age=31536000'
      const fullName = credentials.options?.data?.full_name || 'Valued Member'
      const currency = credentials.options?.data?.currency || 'USD'
      saveLocalProfile({ full_name: fullName, currency })
      return { data: { user: { id: 'demo-user', email: credentials.email } }, error: null }
    },
    signOut: async () => {
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
      return { error: null }
    }
  },
  from: (table: string) => new MockQueryBuilder(table)
})

export function createClient() {
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-project-url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'

  if (!isSupabaseConfigured) {
    return createMockClient() as any
  }

  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (e) {
    console.warn('Browser Supabase client creation failed, using mock client:', e)
    return createMockClient() as any
  }
}
