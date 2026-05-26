'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, password: false })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange' })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex text-slate-200">
      {/* Left Panel - Brand/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="glow-bg" />
        <div className="grid-overlay" />
        
        <div className="relative z-10 flex flex-col justify-center p-16 w-full">
          <div className="max-w-md">
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <Lock className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs text-indigo-400 font-bold tracking-widest">Finance</div>
                  <div className="text-lg font-bold text-slate-100">Personal Financial Hub</div>
                </div>
              </div>

              <h1 className="text-5xl font-extrabold leading-tight mb-6">
                Take control of your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 block mt-2">
                  financial future.
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed">
                Connect your accounts, budget wisely, and see your wealth grow with our automated, secure analytical dashboards.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: '🔒', title: 'Bank-Grade Security', text: 'End-to-end encrypted databases' },
                { icon: '📊', title: 'Real-Time Insights', text: 'Stunning visualizations of your assets' },
                { icon: '💡', title: 'Smart Budgeting', text: 'Set limits and hit savings goals easily' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-lg flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-400">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 bg-slate-950/40 relative">
        <div className="mx-auto w-full max-w-md z-10">
          {/* Logo on mobile */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">Finance</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to continue monitoring your assets</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Sign in to your account</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to access your financial dashboard</p>
          </div>

          <div className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex gap-3 items-center">
                <Shield className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <div>
                  <div className="font-semibold">Sign in failed</div>
                  <div className="opacity-90">{errorMsg}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Email address</span>
                  {errors.email && <span className="text-rose-400 font-medium">Invalid email</span>}
                </label>

                <div className={`relative transition-all duration-200 ${isFocused.email ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className={`w-5 h-5 ${isFocused.email ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>

                  <input
                    {...register('email', {
                      required: true,
                      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    })}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    onFocus={() => setIsFocused(f => ({ ...f, email: true }))}
                    onBlur={() => setIsFocused(f => ({ ...f, email: false }))}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                </div>

                <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className={`w-5 h-5 ${isFocused.password ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>

                  <input
                    {...register('password', { required: true })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    onFocus={() => setIsFocused(f => ({ ...f, password: true }))}
                    onBlur={() => setIsFocused(f => ({ ...f, password: false }))}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-sm text-slate-400 mt-6 pt-6 border-t border-slate-900/60">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
