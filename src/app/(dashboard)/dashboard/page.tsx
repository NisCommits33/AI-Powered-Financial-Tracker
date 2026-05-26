'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { seedUserDatabase } from '@/utils/supabase/seeder'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus,
  Loader2,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import Recharts with SSR disabled to prevent hydration issues
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })

interface Account {
  id: string
  name: string
  account_type: string
  balance: number
  currency: string
}

interface Transaction {
  id: string
  amount: number
  transaction_type: 'income' | 'expense'
  description: string
  transaction_date: string
  categories?: { name: string; color: string }
  accounts?: { name: string }
}

export default function DashboardOverview() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  
  // Aggregate stats
  const [totalBalance, setTotalBalance] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyExpense, setMonthlyExpense] = useState(0)
  
  // Chart states
  const [spendingByCategory, setSpendingByCategory] = useState<{ name: string; value: number; color: string }[]>([])
  const [cashFlowData, setCashFlowData] = useState<{ date: string; Income: number; Expenses: number }[]>([])

  // Seeding states
  const [seeding, setSeeding] = useState(false)
  const [triggerFetch, setTriggerFetch] = useState(0)

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in first!')
        return
      }
      const res = await seedUserDatabase(supabase, user.id)
      if (res.success) {
        setTriggerFetch(prev => prev + 1)
      } else {
        alert(`Failed to seed data: ${res.error}`)
      }
    } catch (err: any) {
      console.error(err)
      alert(`Unexpected error during seeding: ${err.message || err}`)
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        
        if (profile) setCurrency(profile.currency)

        // 2. Fetch Accounts
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
        
        const accountsList = accountsData || []
        setAccounts(accountsList)

        // Calculate total balance
        const balanceTotal = accountsList.reduce((acc: number, curr: any) => acc + Number(curr.balance), 0)
        setTotalBalance(balanceTotal)

        // 3. Fetch Transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            transaction_type,
            description,
            transaction_date,
            categories (name, color),
            accounts (name)
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        const transactionsList = (transactionsData || []).map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          transaction_type: t.transaction_type,
          description: t.description,
          transaction_date: t.transaction_date,
          categories: t.categories,
          accounts: t.accounts
        }))

        setRecentTransactions(transactionsList.slice(0, 5))

        // Calculate Monthly Metrics (For current month/year)
        const now = new Date()
        const currentMonth = now.getMonth() // 0-11
        const currentYear = now.getFullYear()

        let incomeSum = 0
        let expenseSum = 0
        const categoryMap: { [key: string]: { value: number; color: string } } = {}

        transactionsList.forEach((t: any) => {
          const tDate = new Date(t.transaction_date)
          if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            if (t.transaction_type === 'income') {
              incomeSum += t.amount
            } else {
              expenseSum += t.amount
              
              // Group expenses by category for pie chart
              const catName = t.categories?.name || 'Uncategorized'
              const catColor = t.categories?.color || '#64748b'
              if (!categoryMap[catName]) {
                categoryMap[catName] = { value: 0, color: catColor }
              }
              categoryMap[catName].value += t.amount
            }
          }
        })

        setMonthlyIncome(incomeSum)
        setMonthlyExpense(expenseSum)

        // Format spending by category
        const pieData = Object.keys(categoryMap).map(key => ({
          name: key,
          value: Number(categoryMap[key].value.toFixed(2)),
          color: categoryMap[key].color
        }))
        setSpendingByCategory(pieData)

        // Build Cashflow historical chart (last 6 months)
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date()
          d.setMonth(now.getMonth() - i)
          return {
            month: d.getMonth(),
            year: d.getFullYear(),
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            Income: 0,
            Expenses: 0
          }
        }).reverse()

        transactionsList.forEach((t: any) => {
          const tDate = new Date(t.transaction_date)
          last6Months.forEach((m: any) => {
            if (tDate.getMonth() === m.month && tDate.getFullYear() === m.year) {
              if (t.transaction_type === 'income') {
                m.Income += t.amount
              } else {
                m.Expenses += m.Expenses + t.amount
              }
            }
          })
        })

        setCashFlowData(last6Months.map((m: any) => ({
          date: m.label,
          Income: Number(m.Income.toFixed(2)),
          Expenses: Number(m.Expenses.toFixed(2))
        })))

      } catch (err) {
        console.error('Error fetching dashboard summary:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, triggerFetch])

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Assembling financial metrics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Here is a summary of your financial assets and spending distributions</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/transactions?add=true" 
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </Link>
        </div>
      </div>

      {/* Seeding Welcome Card */}
      {accounts.length === 0 && (
        <div className="glass-panel p-6 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
              <span>🚀 Welcome to Finance!</span>
            </h3>
            <p className="text-sm text-slate-300">
              It looks like your database doesn't have any accounts or transactions yet. Would you like to seed your real database tables with beautiful dummy data so you can explore the premium overview dashboard right away?
            </p>
          </div>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 text-sm whitespace-nowrap self-stretch md:self-auto justify-center cursor-pointer"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Seeding database...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Seed Sample Data
              </>
            )}
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Net Worth */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Balance</span>
            <Wallet className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-slate-100">{formatMoney(totalBalance)}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              Across {accounts.length} active accounts
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Income</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-emerald-400">{formatMoney(monthlyIncome)}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Current Calendar Month
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-rose-400">{formatMoney(monthlyExpense)}</h3>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Current Calendar Month
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-slate-900/40 flex flex-col">
          <h3 className="font-bold text-lg text-slate-200">Historical Cash Flow</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-6">Compare monthly deposits against outgoing expenses</p>
          
          <div className="h-72 w-full flex-1">
            {cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Not enough history to map chart data
              </div>
            )}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/40 flex flex-col">
          <h3 className="font-bold text-lg text-slate-200">Spending By Category</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Breakdown of outgoing expenses for the current month</p>
          
          <div className="h-56 w-full relative flex-1 flex items-center justify-center">
            {spendingByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs text-center px-4">
                No monthly expense transactions recorded yet
              </div>
            )}
          </div>

          {/* Categories legend list */}
          {spendingByCategory.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-900/50 max-h-24 overflow-y-auto pr-1">
              {spendingByCategory.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium truncate text-slate-300">{cat.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 ml-auto">{formatMoney(cat.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accounts & Transactions Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="glass-panel p-6 rounded-2xl bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-200">My Accounts</h3>
            <Link href="/accounts" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Manage
            </Link>
          </div>
          
          <div className="space-y-3.5 overflow-y-auto max-h-80 pr-1 flex-1">
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <div key={acc.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{acc.name}</p>
                    <p className="text-xxs uppercase font-bold text-slate-500 tracking-wider mt-0.5">{acc.account_type}</p>
                  </div>
                  <span className={`text-sm font-bold ${Number(acc.balance) >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                    {formatMoney(Number(acc.balance))}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs text-slate-500">No linked bank accounts</p>
                <Link href="/accounts" className="text-xxs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20">
                  Setup first account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-200">Recent Activity</h3>
            <Link href="/transactions" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-80 pr-1 flex-1">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => {
                const isIncome = tx.transaction_type === 'income'
                return (
                  <div key={tx.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isIncome ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownLeft className="h-4.5 w-4.5" />}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {tx.categories?.name || 'Uncategorized'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {tx.accounts?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-xs text-slate-500">No transaction logs available</p>
                <Link href="/transactions" className="text-xxs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20">
                  Log your first transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
