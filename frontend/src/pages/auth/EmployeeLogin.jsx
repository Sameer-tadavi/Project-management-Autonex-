import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Clock, CalendarCheck, UserPlus, ChevronDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi, skillsApi } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

const EmployeeLogin = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', name: '', skills: []
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

    // Fetch available skills for signup
    const { data: skillsList } = useQuery({
        queryKey: ['skills'],
        queryFn: skillsApi.getAll,
        enabled: isSignup,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (serverError) setServerError('');
    };

    const toggleSkill = (skillName) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skillName)
                ? prev.skills.filter(s => s !== skillName)
                : [...prev.skills, skillName],
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (isSignup && !formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
        if (isSignup && formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loginMutation = useMutation({
        mutationFn: (creds) => authApi.login(creds),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            navigate('/employee/dashboard');
        },
        onError: (err) => setServerError(err.response?.data?.detail || 'Invalid credentials.'),
    });

    const signupMutation = useMutation({
        mutationFn: (body) => authApi.signup(body),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            navigate('/employee/dashboard');
        },
        onError: (err) => setServerError(err.response?.data?.detail || 'Signup failed.'),
    });

    const isLoading = loginMutation.isPending || signupMutation.isPending;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setServerError('');

        if (isSignup) {
            signupMutation.mutate({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                skills: formData.skills,
                role: 'employee',
            });
        } else {
            loginMutation.mutate({ email: formData.email, password: formData.password });
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Fresh Emerald Theme */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute inset-0">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/3 right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-white/5 rounded-full"></div>
                </div>

                {/* Dotted Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}></div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Autonex</h1>
                            <p className="text-sm text-emerald-100">Employee Portal</p>
                        </div>
                    </div>

                    {/* Main Copy */}
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Your Workspace.<br />
                        <span className="text-emerald-200">Simplified.</span>
                    </h2>
                    <p className="text-lg text-emerald-100 mb-10 max-w-md">
                        View your assignments, track time, and manage leave requests — all in one place.
                    </p>

                    {/* Quick Access Cards */}
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <Clock className="w-6 h-6 text-emerald-200 mb-2" />
                            <h3 className="font-semibold text-sm">Time Tracking</h3>
                            <p className="text-xs text-emerald-200 mt-1">Log your hours easily</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <CalendarCheck className="w-6 h-6 text-emerald-200 mb-2" />
                            <h3 className="font-semibold text-sm">Leave Requests</h3>
                            <p className="text-xs text-emerald-200 mt-1">Apply in seconds</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login / Signup Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">Employee Portal</span>
                        </div>
                    </div>

                    {/* Toggle Login / Signup */}
                    <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => { setIsSignup(false); setErrors({}); setServerError(''); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isSignup ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsSignup(true); setErrors({}); setServerError(''); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isSignup ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Header */}
                    <div className="mb-6 text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isSignup ? 'Create Account' : 'Welcome back! 👋'}
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm">
                            {isSignup ? 'Register to get started' : 'Sign in to access your workspace'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {serverError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium text-center">
                                {serverError}
                            </div>
                        )}

                        {/* Name (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.name ? 'border-red-300' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@company.com"
                                    className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.email ? 'border-red-300' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password" name="password" value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.password ? 'border-red-300' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm transition-all outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        {/* Skills Dropdown (signup only) */}
                        {isSignup && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills</label>
                                <button
                                    type="button"
                                    onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm text-left focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                                >
                                    <span className={formData.skills.length ? 'text-slate-900' : 'text-slate-400'}>
                                        {formData.skills.length ? formData.skills.join(', ') : 'Select skills...'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                                {skillDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {(skillsList || []).map(s => (
                                            <label key={s.id} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.skills.includes(s.name)}
                                                    onChange={() => toggleSkill(s.name)}
                                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                                                />
                                                {s.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {isSignup ? 'Creating Account...' : 'Signing in...'}
                                </span>
                            ) : (
                                <>
                                    {isSignup ? 'Create Account' : 'Access Workspace'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Help Text */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Having trouble? Contact <a href="#" className="text-emerald-600 hover:underline">HR Support</a>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Autonex Inc. • Employee Portal
                </p>
            </div>
        </div>
    );
};

export default EmployeeLogin;
