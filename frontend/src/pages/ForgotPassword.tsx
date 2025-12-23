import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';

interface ForgotPasswordInputs {
    email: string;
}

const ForgotPassword: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordInputs>({ mode: 'onChange' });

    const onSubmit = async (data: ForgotPasswordInputs) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Reset password for:', data.email);
        setIsLoading(false);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid"></div>

                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col justify-center p-12 w-full">
                    <div className="max-w-md">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                    <KeyRound className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 font-medium">SECURITY FIRST</div>
                                    <div className="text-2xl font-bold text-white">Account Recovery</div>
                                </div>
                            </div>

                            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                                Forgot your
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    {' '}password?
                                </span>
                            </h1>

                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                Don't worry, it happens to the best of us. We'll help you get back into your account in no time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="mx-auto w-full max-w-md">
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>

                    {!isSubmitted ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Enter the email address associated with your account and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                        <span>Email address</span>
                                        {errors.email && (
                                            <span className="text-sm font-normal text-red-600 dark:text-red-400 animate-in fade-in">
                                                Required field
                                            </span>
                                        )}
                                    </label>

                                    <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.01]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className={`w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : isFocused ? 'text-purple-500' : 'text-gray-400'}`} />
                                        </div>

                                        <input
                                            {...register('email', {
                                                required: true,
                                                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            })}
                                            type="email"
                                            placeholder="name@company.com"
                                            autoComplete="email"
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            className={`w-full pl-11 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                                                ${errors.email
                                                    ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30'
                                                    : isFocused
                                                        ? 'border-purple-300 dark:border-purple-700 focus:border-purple-400 focus:ring-purple-100 dark:focus:ring-purple-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-purple-400 focus:ring-purple-100'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !isValid}
                                    className={`w-full py-4 px-4 rounded-xl font-medium text-white transition-all duration-300 transform active:scale-[0.99]
                                        ${isLoading || !isValid
                                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl active:shadow-lg dark:shadow-purple-900/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-center">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                                Sending Link...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">
                                We have sent a password reset link to <span className="font-medium text-gray-900 dark:text-white">{isValid && 'your email'}</span>.
                                Please check your inbox and follow the instructions.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300"
                                >
                                    Didn't receive the email? Click to resend
                                </button>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
