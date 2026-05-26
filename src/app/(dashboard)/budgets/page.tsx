'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, X, Check, Loader2, Info, AlertTriangle } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
}

interface BudgetCategory {
  id: string
  allocated_amount: number
  spent_amount: number
  category_id: string
  categories: Category
}

interface Budget {
  id: string
  name: string
  month: string
  total_amount: number
  budget_categories: BudgetCategory[]
}

export default function BudgetsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Modal & Add state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [month, setMonth] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  
  // Category allocation setup
  const [allocations, setAllocations] = useState<{ [catId: string]: string }>({})
  
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch Currency
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        
        if (profile) setCurrency(profile.currency)

        // 2. Fetch Categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, color')
          .order('name', { ascending: true })
        setCategories(categoriesData || [])

        // 3. Fetch Budgets & Categories allocation
        const { data: budgetsData } = await supabase
          .from('budgets')
          .select(`
            id,
            name,
            month,
            total_amount,
            budget_categories (
              id,
              allocated_amount,
              spent_amount,
              category_id,
              categories (id, name, color)
            )
          `)
          .eq('user_id', user.id)
          .order('month', { ascending: false })

        const formattedBudgets = (budgetsData || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          month: b.month,
          total_amount: Number(b.total_amount),
          budget_categories: (b.budget_categories || []).map((bc: any) => ({
            id: bc.id,
            allocated_amount: Number(bc.allocated_amount),
            spent_amount: Number(bc.spent_amount),
            category_id: bc.category_id,
            categories: bc.categories
          }))
        }))

        // 4. Calculate actual live spending for each budget's categories
        // To be extremely accurate and live: let's query all transactions in the budget's month
        // and aggregate them live to override spent_amount in the database if there are recent edits!
        for (const budget of formattedBudgets) {
          const budgetDate = new Date(budget.month)
          const startYear = budgetDate.getFullYear()
          const startMonth = budgetDate.getMonth() // 0-11
          
          // First day of budget month
          const startDateStr = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-01`
          // Last day of budget month
          const lastDay = new Date(startYear, startMonth + 1, 0).getDate()
          const endDateStr = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

          const { data: monthlyTx } = await supabase
            .from('transactions')
            .select('amount, category_id')
            .eq('user_id', user.id)
            .eq('transaction_type', 'expense')
            .gte('transaction_date', startDateStr)
            .lte('transaction_date', endDateStr)

          const txSums: { [catId: string]: number } = {}
          if (monthlyTx) {
            monthlyTx.forEach((t: any) => {
              if (t.category_id) {
                txSums[t.category_id] = (txSums[t.category_id] || 0) + Number(t.amount)
              }
            })
          }

          // Override local spent amount with live transactional calculations
          budget.budget_categories.forEach((bc: any) => {
            bc.spent_amount = txSums[bc.category_id] || 0
          })
        }

        setBudgets(formattedBudgets)

        // Prep empty allocations form
        const initialAllocations: { [key: string]: string } = {}
        categoriesData?.forEach((c: any) => {
          initialAllocations[c.id] = ''
        })
        setAllocations(initialAllocations)

      } catch (err) {
        console.error('Failed loading budgets:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBudgetData()
  }, [supabase])

  const handleOpenAdd = () => {
    setName('')
    // Default to current year-month
    const now = new Date()
    setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    setTotalAmount('')
    
    // Clear allocations
    const newAllocations: { [key: string]: string } = {}
    categories.forEach((c) => {
      newAllocations[c.id] = ''
    })
    setAllocations(newAllocations)
    setFormError(null)
    setIsAddOpen(true)
  }

  const handleAllocationChange = (catId: string, val: string) => {
    setAllocations({
      ...allocations,
      [catId]: val
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const numTotal = parseFloat(totalAmount)
      if (isNaN(numTotal) || numTotal <= 0) {
        setFormError('Please enter a valid positive budget amount.')
        setFormLoading(false)
        return
      }

      // Check sum of allocations matches or fits
      let sumAllocations = 0
      const validAllocations: { category_id: string; amount: number }[] = []

      Object.keys(allocations).forEach((catId) => {
        const val = parseFloat(allocations[catId])
        if (!isNaN(val) && val > 0) {
          sumAllocations += val
          validAllocations.push({ category_id: catId, amount: val })
        }
      })

      if (sumAllocations > numTotal) {
        setFormError(`Sum of allocations (${formatMoney(sumAllocations)}) exceeds total budget limit (${formatMoney(numTotal)}).`)
        setFormLoading(false)
        return
      }

      // Format month as YYYY-MM-DD (e.g. YYYY-MM-01)
      const formattedMonth = `${month}-01`

      // 1. Insert Budget
      const { data: budgetObj, error: budgetErr } = await supabase
        .from('budgets')
        .insert({
          name,
          month: formattedMonth,
          total_amount: numTotal,
          user_id: user.id
        })
        .select()
        .single()

      if (budgetErr) throw budgetErr

      // 2. Insert Budget Categories
      const allocationsPayload = validAllocations.map(a => ({
        budget_id: budgetObj.id,
        category_id: a.category_id,
        allocated_amount: a.amount,
        spent_amount: 0.00
      }))

      if (allocationsPayload.length > 0) {
        const { error: allocErr } = await supabase
          .from('budget_categories')
          .insert(allocationsPayload)

        if (allocErr) throw allocErr
      }

      // Re-fetch or locally append budget item to list
      // For absolute correctness and since we did a custom live fetch, let's refresh page
      window.location.reload()
      
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while creating budget.')
      setFormLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget plan?')) return

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (err) {
      console.error('Failed to delete budget:', err)
      alert('Failed to delete budget.')
    }
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Calculating budget constraints...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Budgets & Limits</h1>
          <p className="text-slate-400 text-sm mt-1">Setup monthly budgets, allocate expenses, and track actual spent records</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" /> Create Budget
        </button>
      </div>

      {/* Budgets List */}
      {budgets.length > 0 ? (
        <div className="space-y-8">
          {budgets.map((budget) => {
            // Aggregate spent across allocations
            const totalSpent = budget.budget_categories.reduce((acc, curr) => acc + curr.spent_amount, 0)
            const pctUsed = Math.min((totalSpent / budget.total_amount) * 100, 100)
            
            return (
              <div 
                key={budget.id}
                className="glass-panel p-6 rounded-2xl bg-slate-900/40 border border-slate-950/80"
              >
                {/* Upper Details */}
                <div className="flex items-start justify-between border-b border-slate-900/80 pb-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-200">{budget.name}</h3>
                      <span className="text-xxs font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Total Allocated: {formatMoney(budget.total_amount)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="px-3 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-xxs font-bold rounded-lg transition-colors"
                  >
                    Delete Plan
                  </button>
                </div>

                {/* Overall Progress */}
                <div className="mb-6 space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Overall Month Progress</span>
                    <span>{formatMoney(totalSpent)} / {formatMoney(budget.total_amount)} ({pctUsed.toFixed(0)}%)</span>
                  </div>
                  
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pctUsed >= 90 ? 'bg-rose-500' : pctUsed >= 75 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>
                  
                  {pctUsed >= 90 && (
                    <div className="flex gap-2 items-center text-rose-400 text-xxs font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Warning: You have utilized {pctUsed.toFixed(0)}% of your total budgeted limit!</span>
                    </div>
                  )}
                </div>

                {/* Categories Allocations */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Category Allocations</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {budget.budget_categories.length > 0 ? (
                      budget.budget_categories.map((bc) => {
                        const bcPct = Math.min((bc.spent_amount / bc.allocated_amount) * 100, 100)
                        
                        return (
                          <div key={bc.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bc.categories.color }} />
                                <span className="text-sm font-semibold text-slate-200">{bc.categories.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">
                                {formatMoney(bc.spent_amount)} / {formatMoney(bc.allocated_amount)}
                              </span>
                            </div>

                            {/* Bar */}
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  backgroundColor: bc.categories.color, 
                                  width: `${bcPct}%` 
                                }}
                              />
                            </div>

                            {/* Sub-text */}
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                              <span>Remaining: {formatMoney(Math.max(bc.allocated_amount - bc.spent_amount, 0))}</span>
                              <span>{bcPct.toFixed(0)}% utilized</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-2 text-center text-slate-500 text-xs py-4">
                        No specific category allocations configured for this month
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl bg-slate-900/20 text-center max-w-lg mx-auto border border-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl">
            📊
          </div>
          <h3 className="text-lg font-bold text-slate-300">No active budgets</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Create monthly budget plans to align your spending categories, allocate limits, and visualize real-time progress meters.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-6 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition-all"
          >
            Create first budget plan
          </button>
        </div>
      )}

      {/* Add sliding modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <h3 className="font-bold text-lg text-slate-200">Create Monthly Budget Plan</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex gap-2 items-center">
                <Info className="h-4 w-4 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Saving, Winter Budget"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  />
                </div>

                {/* Target Month */}
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Target Month</label>
                  <input
                    type="month"
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Total Budget Limit */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Total Monthly Budget ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Category Allocations */}
              <div className="pt-2">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Category Allocations (Optional)</label>
                
                <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between gap-4 p-2 bg-slate-900/40 rounded-lg border border-slate-900/60">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                      </div>
                      
                      <div className="w-32 flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">{currency}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={allocations[cat.id] || ''}
                          onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-xs text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-900 mt-2">
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
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Plan...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Budget Plan
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
