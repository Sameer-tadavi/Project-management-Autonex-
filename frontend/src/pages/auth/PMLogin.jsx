import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, Briefcase, FolderKanban, Users } from 'lucide-react';
import { authApi } from '../../services/api';

const PMLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/pm/dashboard';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const loginMutation = useMutation({
        mutationFn: (creds) => authApi.login(creds),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            navigate(from, { replace: true });
        },
        onError: (err) => setError(err.response?.data?.detail || 'Invalid credentials.'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        loginMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Deep Blue PM Theme */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/5 rounded-full"></div>
                    <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/10 rounded-full"></div>
                </div>

                <div className="absolute inset-0 opacity-[0.06]" style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Autonex</h1>
                            <p className="text-sm text-blue-200">Project Manager Portal</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Lead Your<br />
                        <span className="text-blue-200">Projects.</span>
                    </h2>
                    <p className="text-lg text-blue-200 mb-10 max-w-md">
                        Manage teams, track progress, approve requests, and deliver on time.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <FolderKanban className="w-6 h-6 text-blue-200 mb-2" />
                            <h3 className="font-semibold text-sm">Project Oversight</h3>
                            <p className="text-xs text-blue-200 mt-1">Full project management</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <Users className="w-6 h-6 text-blue-200 mb-2" />
                            <h3 className="font-semibold text-sm">Team Management</h3>
                            <p className="text-xs text-blue-200 mt-1">Manage your people</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">PM Portal</span>
                        </div>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Manager Login</h2>
                        <p className="text-slate-500 mt-2 text-sm">Sign in to manage your projects</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email" value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="pm@company.com"
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    disabled={loginMutation.isPending}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password" value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    disabled={loginMutation.isPending}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loginMutation.isPending}
                            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                        >
                            {loginMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Not a PM? <button onClick={() => navigate('/login/employee')} className="text-blue-600 hover:underline font-medium">Employee Portal</button>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Autonex Inc. • PM Portal
                </p>
            </div>
        </div>
    );
};

export default PMLogin;
