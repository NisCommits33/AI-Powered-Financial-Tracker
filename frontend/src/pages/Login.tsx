import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { useAppDispatch } from '../store/hooks';
import { LoginCredentials } from '../types';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [login, { isLoading, error }] = useLoginMutation();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState({ email: false, password: false });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
    } = useForm<LoginCredentials>({ mode: 'onChange' });

    const onSubmit = async (data: LoginCredentials) => {
        try {
            // Step 1: Login and get tokens
            const userData = await login(data).unwrap();

            // Step 2: Store tokens first
            dispatch(setCredentials({
                accessToken: userData.access_token,
                refreshToken: userData.refresh_token
            }));

            // Step 3: Fetch real user data using the new token
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${userData.access_token}`
                }
            });

            if (response.ok) {
                const userInfo = await response.json();
                // Step 4: Update with real user data
                dispatch(setCredentials({
                    user: userInfo
                }));

                // Step 5: Only navigate after everything is set up
                navigate('/dashboard');
            } else {
                console.error('Failed to fetch user info');
                // If we can't get user info, still try to navigate
                // The dashboard will handle the missing user data
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Failed to login:', err);
        }
    };

    const getErrorMessage = (error: any) => {
        if (!error) return null;
        if ('data' in error) {
            const detail = (error.data as any).detail;
            if (Array.isArray(detail)) {
                return detail.map((e: any) => e.msg).join(', ');
            }
            return detail || 'Login failed. Please check your credentials.';
        }
        return 'An unexpected error occurred.';
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand/Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid"></div>

                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col justify-center p-12 w-full">
                    <div className="max-w-md">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 font-medium">FINANCE DASHBOARD</div>
                                    <div className="text-2xl font-bold text-white">Enterprise Edition</div>
                                </div>
                            </div>

                            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                                Secure access to your
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    {' '}financial hub
                                </span>
                            </h1>

                            <p className="text-gray-300 text-lg leading-relaxed">
                                Monitor cash flow, analyze spending patterns, and make data-driven financial decisions with our advanced dashboard.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: '🔒', text: 'Bank-level encryption & security' },
                                { icon: '📊', text: 'Real-time financial analytics' },
                                { icon: '🚀', text: 'Lightning-fast performance' }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-gray-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center p-8 bg-white">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile header */}
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">Finance Dashboard</div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500 mt-1">Sign in to continue to your account</p>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
                        <p className="text-gray-500">Enter your credentials to access your dashboard</p>
                    </div>

                    {/* Form Card */}
                    <div className="space-y-6">
                        {error && (
                            <div className="animate-in slide-in-from-top duration-300">
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Shield className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-red-900">Authentication failed</div>
                                            <div className="text-sm text-red-700 mt-1">{getErrorMessage(error)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                                    <span>Email address</span>
                                    {errors.email && (
                                        <span className="text-sm font-normal text-red-600 animate-in fade-in">
                                            Required field
                                        </span>
                                    )}
                                </label>

                                <div className={`relative transition-all duration-200 ${isFocused.email ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : isFocused.email ? 'text-blue-500' : 'text-gray-400'}`} />
                                    </div>

                                    <input
                                        {...register('email', {
                                            required: true,
                                            pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        })}
                                        type="email"
                                        placeholder="name@company.com"
                                        autoComplete="email"
                                        onFocus={() => setIsFocused(f => ({ ...f, email: true }))}
                                        onBlur={() => setIsFocused(f => ({ ...f, email: false }))}
                                        className={`w-full pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.email
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                                : isFocused.email
                                                    ? 'border-blue-300 focus:border-blue-400 focus:ring-blue-100'
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : isFocused.password ? 'text-blue-500' : 'text-gray-400'}`} />
                                    </div>

                                    <input
                                        {...register('password', {
                                            required: true,
                                            minLength: 6,
                                        })}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        onFocus={() => setIsFocused(f => ({ ...f, password: true }))}
                                        onBlur={() => setIsFocused(f => ({ ...f, password: false }))}
                                        className={`w-full pl-11 pr-12 py-3.5 text-gray-900 placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.password
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                                : isFocused.password
                                                    ? 'border-blue-300 focus:border-blue-400 focus:ring-blue-100'
                                                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100'
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !isDirty || !isValid}
                                className={`w-full py-4 px-4 rounded-xl font-medium text-white transition-all duration-300 transform active:scale-[0.99]
                                    ${isLoading || !isDirty || !isValid
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:shadow-lg'
                                    }`}
                            >
                                <div className="flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Dashboard
                                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or sign in with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">GitHub</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="pt-6 border-t border-gray-100">
                            <p className="text-center text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center group"
                                >
                                    Get started free
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </p>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                No credit card required • 14-day free trial
                            </p>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span>Protected by end-to-end encryption</span>
                            <div className="flex">
                                <div className="w-1 h-1 bg-green-500 rounded-full mx-0.5"></div>
                                <div className="w-1 h-1 bg-green-500 rounded-full mx-0.5"></div>
                                <div className="w-1 h-1 bg-green-500 rounded-full mx-0.5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;