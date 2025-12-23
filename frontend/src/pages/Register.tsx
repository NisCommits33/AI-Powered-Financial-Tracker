import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/api/authApi';
import { RegisterData } from '../types';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react';

interface RegisterFormInputs extends RegisterData {
    confirm_password: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [registerUser, { isLoading, error }] = useRegisterMutation();
    const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
    const [isFocused, setIsFocused] = useState({
        full_name: false,
        email: false,
        password: false,
        confirm_password: false
    });
    const [passwordStrength, setPasswordStrength] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isValid },
    } = useForm<RegisterFormInputs>({ mode: 'onChange' });

    const password = watch('password', '');
    const confirmPassword = watch('confirm_password', '');

    const calculatePasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 6) strength += 1;
        if (pwd.length >= 8) strength += 1;
        if (/[A-Z]/.test(pwd)) strength += 1;
        if (/[0-9]/.test(pwd)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
        return strength;
    };

    React.useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(password));
    }, [password]);

    const onSubmit = async (data: RegisterFormInputs) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirm_password, ...registerData } = data;
            await registerUser(registerData).unwrap();
            navigate('/login');
            // You might want to use a toast notification here instead of alert
        } catch (err) {
            console.error('Failed to register:', err);
        }
    };

    const getErrorMessage = (error: any) => {
        if (!error) return null;
        if ('data' in error) {
            return (error.data as any).detail || 'Registration failed. Please try again.';
        }
        return 'An unexpected error occurred.';
    };

    const requirements = [
        { id: 'length', label: 'At least 6 characters', met: password.length >= 6 },
        { id: 'number', label: 'Contains a number', met: /\d/.test(password) },
        { id: 'uppercase', label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand/Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid"></div>

                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col justify-center p-12 w-full">
                    <div className="max-w-md">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 font-medium">FINANCE DASHBOARD</div>
                                    <div className="text-2xl font-bold text-white">Begin Your Journey</div>
                                </div>
                            </div>

                            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                                Start managing
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                                    {' '}your finances
                                </span>
                                <br />
                                with confidence
                            </h1>

                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                Join thousands who trust our platform to track, analyze, and optimize their financial health.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: '📊',
                                    title: 'Real-time Analytics',
                                    description: 'Monitor spending patterns as they happen'
                                },
                                {
                                    icon: '🔐',
                                    title: 'Bank-level Security',
                                    description: 'Your data is encrypted end-to-end'
                                },
                                {
                                    icon: '🚀',
                                    title: '14-day Free Trial',
                                    description: 'Full access to all premium features'
                                }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
                                    <div className="text-2xl">{feature.icon}</div>
                                    <div>
                                        <div className="font-medium text-white mb-1">{feature.title}</div>
                                        <div className="text-sm text-gray-400">{feature.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="flex-1 flex flex-col justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-200 overflow-y-auto">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile header */}
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">Join Finance Dashboard</div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Start your financial journey with us</p>
                    </div>

                    {/* Desktop header */}
                    <div className="hidden lg:block mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
                        <p className="text-gray-500 dark:text-gray-400">Join thousands managing their finances smarter</p>
                    </div>

                    {/* Form Card */}
                    <div className="space-y-8">
                        {error && (
                            <div className="animate-in slide-in-from-top duration-300">
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-red-900 dark:text-red-200">Registration error</div>
                                            <div className="text-sm text-red-700 dark:text-red-300 mt-1">{getErrorMessage(error)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Full Name Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                    <span>Full Name</span>
                                    {errors.full_name && (
                                        <span className="text-sm font-normal text-red-600 dark:text-red-400 animate-in fade-in">
                                            Required field
                                        </span>
                                    )}
                                </label>

                                <div className={`relative transition-all duration-200 ${isFocused.full_name ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 transition-colors ${errors.full_name ? 'text-red-400' : isFocused.full_name ? 'text-green-500' : 'text-gray-400'}`} />
                                    </div>

                                    <input
                                        {...register('full_name', {
                                            required: true,
                                            minLength: 2,
                                        })}
                                        type="text"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                        onFocus={() => setIsFocused(f => ({ ...f, full_name: true }))}
                                        onBlur={() => setIsFocused(f => ({ ...f, full_name: false }))}
                                        className={`w-full pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.full_name
                                                ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30'
                                                : isFocused.full_name
                                                    ? 'border-green-300 dark:border-green-700 focus:border-green-400 focus:ring-green-100 dark:focus:ring-green-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-400 focus:ring-green-100'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                    <span>Email address</span>
                                    {errors.email && (
                                        <span className="text-sm font-normal text-red-600 dark:text-red-400 animate-in fade-in">
                                            Required field
                                        </span>
                                    )}
                                </label>

                                <div className={`relative transition-all duration-200 ${isFocused.email ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : isFocused.email ? 'text-green-500' : 'text-gray-400'}`} />
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
                                        className={`w-full pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.email
                                                ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30'
                                                : isFocused.email
                                                    ? 'border-green-300 dark:border-green-700 focus:border-green-400 focus:ring-green-100 dark:focus:ring-green-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-400 focus:ring-green-100'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Password Field with Strength Indicator */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Strength: <span className={`font-bold ${passwordStrength >= 4 ? 'text-green-600 dark:text-green-400' :
                                            passwordStrength >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                                                passwordStrength >= 2 ? 'text-orange-600 dark:text-orange-400' :
                                                    'text-red-600 dark:text-red-400'
                                            }`}>
                                            {passwordStrength >= 4 ? 'Strong' :
                                                passwordStrength >= 3 ? 'Good' :
                                                    passwordStrength >= 2 ? 'Fair' :
                                                        'Weak'}
                                        </span>
                                    </div>
                                </div>

                                <div className={`relative transition-all duration-200 ${isFocused.password ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : isFocused.password ? 'text-green-500' : 'text-gray-400'}`} />
                                    </div>

                                    <input
                                        {...register('password', {
                                            required: true,
                                            minLength: 6,
                                        })}
                                        type={showPassword.password ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
                                        onFocus={() => setIsFocused(f => ({ ...f, password: true }))}
                                        onBlur={() => setIsFocused(f => ({ ...f, password: false }))}
                                        className={`w-full pl-11 pr-12 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.password
                                                ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30'
                                                : isFocused.password
                                                    ? 'border-green-300 dark:border-green-700 focus:border-green-400 focus:ring-green-100 dark:focus:ring-green-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-400 focus:ring-green-100'
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => ({ ...s, password: !s.password }))}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                                    >
                                        {showPassword.password ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Bar */}
                                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${passwordStrength >= 4 ? 'w-full bg-green-500' :
                                            passwordStrength >= 3 ? 'w-3/4 bg-yellow-500' :
                                                passwordStrength >= 2 ? 'w-1/2 bg-orange-500' :
                                                    passwordStrength >= 1 ? 'w-1/4 bg-red-500' :
                                                        'w-0 bg-transparent'
                                            }`}
                                    />
                                </div>

                                {/* Password Requirements */}
                                <div className="space-y-2 mt-4">
                                    {requirements.map(req => (
                                        <div key={req.id} className="flex items-center gap-2 text-sm">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                }`}>
                                                {req.met && <Check className="w-3 h-3" />}
                                            </div>
                                            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                    <span>Confirm Password</span>
                                    {password && confirmPassword && password === confirmPassword && (
                                        <span className="text-sm font-normal text-green-600 dark:text-green-400 animate-in fade-in">
                                            Passwords match
                                        </span>
                                    )}
                                </label>

                                <div className={`relative transition-all duration-200 ${isFocused.confirm_password ? 'scale-[1.01]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors ${errors.confirm_password
                                            ? 'text-red-400'
                                            : isFocused.confirm_password
                                                ? password === confirmPassword ? 'text-green-500' : 'text-yellow-500'
                                                : 'text-gray-400'
                                            }`} />
                                    </div>

                                    <input
                                        {...register('confirm_password', {
                                            required: true,
                                            validate: (value) => value === password || 'Passwords do not match',
                                        })}
                                        type={showPassword.confirm ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        onFocus={() => setIsFocused(f => ({ ...f, confirm_password: true }))}
                                        onBlur={() => setIsFocused(f => ({ ...f, confirm_password: false }))}
                                        className={`w-full pl-11 pr-12 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                            ${errors.confirm_password
                                                ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30'
                                                : isFocused.confirm_password
                                                    ? password === confirmPassword
                                                        ? 'border-green-300 dark:border-green-700 focus:border-green-400 focus:ring-green-100 dark:focus:ring-green-900/30'
                                                        : 'border-yellow-300 dark:border-yellow-700 focus:border-yellow-400 focus:ring-yellow-100 dark:focus:ring-yellow-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-400 focus:ring-green-100'
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => ({ ...s, confirm: !s.confirm }))}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                                    >
                                        {showPassword.confirm ? (
                                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {errors.confirm_password && (
                                    <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-sm">
                                        <div className="w-4 h-4 mr-2">⚠️</div>
                                        {errors.confirm_password.message}
                                    </div>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                                    I agree to the{' '}
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !isDirty || !isValid}
                                className={`w-full py-4 px-4 rounded-xl font-medium text-white transition-all duration-300 transform active:scale-[0.99]
                                    ${isLoading || !isDirty || !isValid
                                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl active:shadow-lg dark:shadow-blue-900/20'
                                    }`}
                            >
                                <div className="flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Start Your Free Trial
                                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors inline-flex items-center group"
                                >
                                    Sign in here
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </p>
                            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                                Get instant access to all features • No credit card required
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;