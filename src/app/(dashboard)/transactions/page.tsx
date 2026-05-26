'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, X, Check, Loader2, ArrowUpRight, ArrowDownLeft, Trash2, ShieldAlert } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

interface Account {
  id: string
  name: string
  balance: number
}

interface Category {
  id: string
  name: string
  color: string
}

interface Transaction {
  id: string
  amount: number
  transaction_type: 'income' | 'expense'
  description: string
  transaction_date: string
  notes?: string
  account_id: string
  category_id?: string
  categories?: Category
  accounts?: Account
}

function TransactionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('USD')
  
  // Data lists
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Modal / Add form states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [txType, setTxType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [txDate, setTxDate] = useState('')
  const [notes, setNotes] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Filtering states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch profile/currency
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        if (profile) setCurrency(profile.currency)

        // 2. Fetch Accounts (for dropdowns)
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('id, name, balance')
          .eq('user_id', user.id)
          .order('name', { ascending: true })
        
        const accountsList = (accountsData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          balance: Number(a.balance)
        }))
        setAccounts(accountsList)
        if (accountsList.length > 0) setAccountId(accountsList[0].id)

        // 3. Fetch Categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, color')
          .order('name', { ascending: true })
        setCategories(categoriesData || [])
        if (categoriesData && categoriesData.length > 0) setCategoryId(categoriesData[0].id)

        // 4. Fetch Transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            transaction_type,
            description,
            transaction_date,
            notes,
            account_id,
            category_id,
            categories (id, name, color),
            accounts (id, name, balance)
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        setTransactions((transactionsData || []).map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          transaction_type: t.transaction_type,
          description: t.description,
          transaction_date: t.transaction_date,
          notes: t.notes,
          account_id: t.account_id,
          category_id: t.category_id,
          categories: t.categories,
          accounts: t.accounts
        })))

        // Check if "add=true" is passed in query string to auto-trigger modal
        if (searchParams.get('add') === 'true') {
          handleOpenAdd()
          // Clean up search query
          router.replace('/transactions')
        }

      } catch (err) {
        console.error('Error fetching transaction activity:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [supabase, searchParams, router])

  const handleOpenAdd = () => {
    setAmount('')
    setTxType('expense')
    setDescription('')
    // Default to current date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    setTxDate(today)
    setNotes('')
    if (accounts.length > 0) setAccountId(accounts[0].id)
    if (categories.length > 0) setCategoryId(categories[0].id)
    setFormError(null)
    setIsAddOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        setFormError('Please enter a valid positive transaction amount.')
        setFormLoading(false)
        return
      }

      if (!accountId) {
        setFormError('An account is required to catalog a transaction.')
        setFormLoading(false)
        return
      }

      // Find the account we are touching
      const selectedAccount = accounts.find(a => a.id === accountId)
      if (!selectedAccount) throw new Error('Selected bank account was not found.')

      // Calculate new account balance
      const balanceImpact = txType === 'income' ? numAmount : -numAmount
      const newAccountBalance = selectedAccount.balance + balanceImpact

      // 1. Insert transaction
      const { data: newTx, error: txErr } = await supabase
        .from('transactions')
        .insert({
          amount: numAmount,
          transaction_type: txType,
          description,
          transaction_date: txDate,
          notes,
          account_id: accountId,
          category_id: categoryId || null,
          user_id: user.id
        })
        .select(`
          id,
          amount,
          transaction_type,
          description,
          transaction_date,
          notes,
          account_id,
          category_id,
          categories (id, name, color),
          accounts (id, name, balance)
        `)
        .single()

      if (txErr) throw txErr

      // 2. Adjust account balance
      const { error: accErr } = await supabase
        .from('accounts')
        .update({ balance: newAccountBalance })
        .eq('id', accountId)

      if (accErr) throw accErr

      // 3. Update local lists
      setTransactions([{
        id: newTx.id,
        amount: Number(newTx.amount),
        transaction_type: newTx.transaction_type,
        description: newTx.description,
        transaction_date: newTx.transaction_date,
        notes: newTx.notes,
        account_id: newTx.account_id,
        category_id: newTx.category_id,
        categories: newTx.categories,
        accounts: newTx.accounts
      }, ...transactions])

      // Adjust account balances in local states too!
      setAccounts(accounts.map(a => a.id === accountId ? { ...a, balance: newAccountBalance } : a))

      setIsAddOpen(false)
    } catch (err: any) {
      setFormError(err.message || 'Failed to save transaction details.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Are you sure you want to delete this transaction record? This will adjust your account balance back!')) return

    try {
      // Find associated account
      const associatedAccount = accounts.find(a => a.id === tx.account_id)
      if (!associatedAccount) throw new Error('Associated bank account was not found.')

      // Reverse transaction balance impact
      const balanceReversal = tx.transaction_type === 'income' ? -tx.amount : tx.amount
      const adjustedAccountBalance = associatedAccount.balance + balanceReversal

      // 1. Delete transaction
      const { error: txErr } = await supabase
        .from('transactions')
        .delete()
        .eq('id', tx.id)

      if (txErr) throw txErr

      // 2. Adjust account balance back
      const { error: accErr } = await supabase
        .from('accounts')
        .update({ balance: adjustedAccountBalance })
        .eq('id', tx.account_id)

      if (accErr) throw accErr

      // 3. Update local states
      setTransactions(transactions.filter(t => t.id !== tx.id))
      setAccounts(accounts.map(a => a.id === tx.account_id ? { ...a, balance: adjustedAccountBalance } : a))

    } catch (err: any) {
      console.error('Delete transaction failed:', err)
      alert(err.message || 'Failed to delete transaction.')
    }
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
  }

  // Filtered transactions computed list
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.transaction_type === filterType
    const matchesAccount = filterAccount === 'all' || t.account_id === filterAccount
    const matchesCategory = filterCategory === 'all' || t.category_id === filterCategory
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    return matchesType && matchesAccount && matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Filtering account transaction logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Transactions Ledger</h1>
          <p className="text-slate-400 text-sm mt-1">Review, categorize, filter, or log transactions across checking profiles</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-5 rounded-2xl bg-slate-900/30 border border-slate-950/80 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-1.5 col-span-1 md:col-span-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Description</label>
          <input
            type="text"
            placeholder="e.g. Groceries, Rent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
          />
        </div>

        {/* Filter Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-2 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* Filter Account */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Account</label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full px-2 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="glass-panel rounded-2xl bg-slate-900/40 border border-slate-950/80 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Account</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-300">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'income'
                  return (
                    <tr key={tx.id} className="hover:bg-slate-950/20 transition-colors">
                      {/* Desc & notes */}
                      <td className="py-4 px-6 font-medium text-slate-100 max-w-xs">
                        <div className="truncate font-semibold">{tx.description}</div>
                        {tx.notes && <div className="text-[10px] text-slate-500 truncate mt-0.5">{tx.notes}</div>}
                      </td>
                      
                      {/* Category tag */}
                      <td className="py-4 px-4">
                        <span 
                          className="px-2.5 py-0.5 rounded-full font-bold text-[10px] border"
                          style={{ 
                            backgroundColor: (tx.categories?.color || '#64748b') + '15',
                            borderColor: (tx.categories?.color || '#64748b') + '30',
                            color: tx.categories?.color || '#64748b' 
                          }}
                        >
                          {tx.categories?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Account */}
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {tx.accounts?.name || 'Unknown Account'}
                      </td>

                      {/* Amount */}
                      <td className={`py-4 px-4 text-right font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                          {isIncome ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No transactions match your current search constraints or filters
            </div>
          )}
        </div>
      </div>

      {/* Add dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <h3 className="font-bold text-lg text-slate-200">Log Financial Transaction</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex gap-2 items-center">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'expense' 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Outgoing Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'income' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Incoming Income
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Transaction Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Groceries, Gas Station"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Account */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">From Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                    className="w-full px-2.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Category Tag</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-2.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Logging Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-xs transition-all cursor-pointer"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Private Notes</label>
                  <input
                    type="text"
                    placeholder="Reference IDs, invoice links..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Logging...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Log Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Assembling transaction ledger...</p>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  )
}
