'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Edit2, ShieldAlert, Loader2, Check, X, CreditCard, Banknote } from 'lucide-react'

interface Account {
  id: string
  name: string
  account_type: 'checking' | 'savings' | 'credit' | 'cash'
  balance: number
  currency: string
  description?: string
}

export default function AccountsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currency, setCurrency] = useState('USD')

  // Form & Modals states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  
  // Input fields
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit' | 'cash'>('checking')
  const [balance, setBalance] = useState('')
  const [description, setDescription] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user default currency
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        
        if (profile) setCurrency(profile.currency)

        // Fetch accounts
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })

        setAccounts((accountsData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          account_type: a.account_type,
          balance: Number(a.balance),
          currency: a.currency,
          description: a.description
        })))
      } catch (err) {
        console.error('Error fetching accounts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [supabase])

  const handleOpenAdd = () => {
    setName('')
    setAccountType('checking')
    setBalance('0')
    setDescription('')
    setFormError(null)
    setIsAddOpen(true)
    setEditingAccount(null)
  }

  const handleOpenEdit = (acc: Account) => {
    setName(acc.name)
    setAccountType(acc.account_type)
    setBalance(String(acc.balance))
    setDescription(acc.description || '')
    setFormError(null)
    setEditingAccount(acc)
    setIsAddOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const numBalance = parseFloat(balance)
      if (isNaN(numBalance)) {
        setFormError('Please enter a valid numeric balance.')
        setFormLoading(false)
        return
      }

      if (editingAccount) {
        // Update Account
        const { error } = await supabase
          .from('accounts')
          .update({
            name,
            account_type: accountType,
            balance: numBalance,
            description
          })
          .eq('id', editingAccount.id)

        if (error) throw error

        setAccounts(accounts.map(a => a.id === editingAccount.id ? {
          ...a,
          name,
          account_type: accountType,
          balance: numBalance,
          description
        } : a))
      } else {
        // Insert Account
        const { data: newAcc, error } = await supabase
          .from('accounts')
          .insert({
            name,
            account_type: accountType,
            balance: numBalance,
            currency,
            description,
            user_id: user.id
          })
          .select()
          .single()

        if (error) throw error

        setAccounts([...accounts, {
          id: newAcc.id,
          name: newAcc.name,
          account_type: newAcc.account_type,
          balance: Number(newAcc.balance),
          currency: newAcc.currency,
          description: newAcc.description
        }])
      }

      setIsAddOpen(false)
    } catch (err: any) {
      setFormError(err.message || 'An error occurred during account saving.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? All associated transactions will be deleted!')) return
    
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAccounts(accounts.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to delete account:', err)
      alert('Failed to delete account.')
    }
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Retrieving bank details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Accounts Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Manage checking, savings, credit cards, or cash accounts</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div 
              key={acc.id} 
              className="glass-panel p-6 rounded-2xl bg-slate-900/40 relative overflow-hidden group flex flex-col justify-between min-h-48 border border-slate-900 hover:border-slate-800"
            >
              {/* Card visual detail */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:from-indigo-500/10 transition-all duration-300" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      {acc.account_type === 'cash' ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-base leading-snug">{acc.name}</h3>
                      <span className="text-xxs uppercase font-semibold text-slate-500 tracking-wider">
                        {acc.account_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {acc.description && (
                  <p className="text-xs text-slate-400 leading-normal mb-4 truncate-2-lines line-clamp-2">
                    {acc.description}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-900/50">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block">Available Balance</span>
                <span className={`text-2xl font-extrabold block mt-1 tracking-tight ${
                  acc.balance >= 0 ? 'text-indigo-300' : 'text-rose-400'
                }`}>
                  {formatMoney(acc.balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl bg-slate-900/20 text-center max-w-lg mx-auto border border-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl">
            💳
          </div>
          <h3 className="text-lg font-bold text-slate-300">No active accounts</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Create checking accounts, savings plans, credit cards, or physical cash lockers to log and analyze transaction activity.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-6 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition-all"
          >
            Add your first account
          </button>
        </div>
      )}

      {/* Add / Edit Sliding Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <h3 className="font-bold text-lg text-slate-200">
                {editingAccount ? 'Edit Account Details' : 'Add New Account'}
              </h3>
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
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chase Checking, Cash Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition-all cursor-pointer"
                  >
                    <option value="checking" className="bg-slate-950">Checking</option>
                    <option value="savings" className="bg-slate-950">Savings</option>
                    <option value="credit" className="bg-slate-950">Credit Card</option>
                    <option value="cash" className="bg-slate-950">Cash</option>
                  </select>
                </div>

                {/* Starting Balance */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Balance ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows={3}
                  placeholder="Primary salary deposit point, monthly subscriptions, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all resize-none"
                />
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
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Account
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
