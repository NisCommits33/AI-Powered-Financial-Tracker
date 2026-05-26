'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Shield, Globe } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ fullName: false, email: false, password: false, currency: false })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange' })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            currency: data.currency,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        // If email confirmation is required, show success. Otherwise, redirect.
        if (signUpData.session) {
          router.push('/dashboard')
          router.refresh()
        } else {
          setSuccess(true)
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during registration.')
    } finally {
      setLoading(false)
    }
  }

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'NPR', name: 'Nepalese Rupee (Rs)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
  ]

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
                Start tracking your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 block mt-2">
                  wealth today.
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed">
                Connect checking accounts, credit cards, investment portfolios, and track monthly budgets with absolute clarity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md">
                <span className="text-indigo-400 font-bold text-sm block mb-1">🎉 Phase 2 Budgeting Included</span>
                <span className="text-xs text-slate-400">Allocate monthly amounts, track live spending, and receive instant budget warnings.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center p-8 bg-slate-950/40 relative">
        <div className="mx-auto w-full max-w-md z-10">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">Finance</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">Get started</h2>
            <p className="text-sm text-slate-400 mt-1">Create your secure profile in a single step</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Create your account</h2>
            <p className="text-slate-400 text-sm">Join Finance and orchestrate your financial flows</p>
          </div>

          <div className="space-y-5">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex gap-3 items-center">
                <Shield className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <div>
                  <div className="font-semibold">Sign up failed</div>
                  <div className="opacity-90">{errorMsg}</div>
                </div>
              </div>
            )}

            {success ? (
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto text-xl">
                  ✉️
                </div>
                <h3 className="text-lg font-bold text-indigo-300">Verify your email</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We have sent a verification link to your email address. Please click the link in the email to activate your account and start using your financial dashboard!
                </p>
                <div className="pt-2">
                  <Link href="/login" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 underline">
                    Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Full name</span>
                    {errors.fullName && <span className="text-rose-400 font-medium">Required</span>}
                  </label>

                  <div className={`relative transition-all duration-200 ${isFocused.fullName ? 'scale-[1.01]' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className={`w-5 h-5 ${isFocused.fullName ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>

                    <input
                      {...register('fullName', { required: true })}
                      type="text"
                      placeholder="John Doe"
                      onFocus={() => setIsFocused(f => ({ ...f, fullName: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, fullName: false }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
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
                      placeholder="name@example.com"
                      autoComplete="email"
                      onFocus={() => setIsFocused(f => ({ ...f, email: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, email: false }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Preferred Currency */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Base Currency</span>
                    {errors.currency && <span className="text-rose-400 font-medium">Required</span>}
                  </label>

                  <div className={`relative transition-all duration-200 ${isFocused.currency ? 'scale-[1.01]' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Globe className={`w-5 h-5 ${isFocused.currency ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>

                    <select
                      {...register('currency', { required: true })}
                      defaultValue="USD"
                      onFocus={() => setIsFocused(f => ({ ...f, currency: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, currency: false }))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code} className="bg-slate-950 text-slate-100">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Password</span>
                    {errors.password && <span className="text-rose-400 font-medium">Min 6 characters</span>}
                  </label>

                  <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.01]' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className={`w-5 h-5 ${isFocused.password ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>

                    <input
                      {...register('password', { required: true, minLength: 6 })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      onFocus={() => setIsFocused(f => ({ ...f, password: true }))}
                      onBlur={() => setIsFocused(f => ({ ...f, password: false }))}
                      className="w-full pl-11 pr-12 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
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
                  className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center text-sm text-slate-400 mt-6 pt-6 border-t border-slate-900/60">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
