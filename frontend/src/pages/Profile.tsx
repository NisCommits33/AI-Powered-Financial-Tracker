import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserUpdate } from '@/types';
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import Navbar from '@/components/layout/Navbar';
import { User as UserIcon, Mail, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
    const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
    const [updateProfile, { isLoading: isUpdating, isSuccess, isError, error }] = useUpdateProfileMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<UserUpdate>();

    useEffect(() => {
        if (user) {
            reset({
                full_name: user.full_name,
                email: user.email,
                currency: user.currency || 'USD',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: UserUpdate) => {
        try {
            await updateProfile(data).unwrap();
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Profile Settings
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Manage your personal information and account settings.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
                        {/* Status Messages */}
                        {isSuccess && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-2 border-l-4 border-green-500">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Profile updated successfully!</span>
                            </div>
                        )}
                        {isError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center gap-2 border-l-4 border-red-500">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">
                                    {/* @ts-ignore */}
                                    {error?.data?.detail || 'Failed to update profile. Please try again.'}
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 pb-8 border-b border-gray-100 dark:border-gray-700">
                                <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
                                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.full_name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            {...register('full_name', { required: 'Full name is required' })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    {errors.full_name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Currency Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Currency</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-bold">$</span>
                                        </div>
                                        <select
                                            {...register('currency')}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white appearance-none"
                                        >
                                            <option value="USD">USD ($) - US Dollar</option>
                                            <option value="EUR">EUR (€) - Euro</option>
                                            <option value="GBP">GBP (£) - British Pound</option>
                                            <option value="INR">INR (₹) - Indian Rupee</option>
                                            <option value="NPR">NPR (Rs.) - Nepalese Rupee</option>
                                            <option value="JPY">JPY (¥) - Japanese Yen</option>
                                            <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                                            <option value="AUD">AUD (A$) - Australian Dollar</option>
                                        </select>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This currency will be used to display all monetary values.</p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdating || !isDirty}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-5 w-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
