'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  PieChart, 
  Tags, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  TrendingUp
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; full_name?: string; currency?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserDetails() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, currency')
          .eq('id', user.id)
          .single()

        setUser({
          email: user.email,
          full_name: profile?.full_name || 'Valued Member',
          currency: profile?.currency || 'USD'
        })
      }
      setLoading(false)
    }
    getUserDetails()
  }, [supabase])

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Categories', href: '/categories', icon: Tags },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950/20 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col glass-panel border-r border-slate-900 bg-slate-950/40 m-4 rounded-2xl">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-900/50">
          <TrendingUp className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finance
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border-l-4 border-indigo-500 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-900/50">
          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            user && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-900">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/10">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-200">{user.full_name}</p>
                    <p className="text-xs text-indigo-400/80 font-medium truncate">{user.currency} Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xs flex-col glass-panel bg-slate-950/95 p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
                <span className="text-lg font-bold text-gradient">Finance</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border-l-4 border-indigo-500'
                        : 'text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {user && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{user.full_name}</p>
                    <p className="text-xs text-indigo-400">{user.currency}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between md:justify-end px-6 md:px-8 border-b border-slate-900/40 glass-panel md:bg-transparent m-4 mb-0 rounded-2xl">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-950/60 rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-gradient">Finance</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
              Live Environment
            </span>
          </div>
        </header>

        {/* Scrollable Dashboard Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
