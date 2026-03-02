import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { authApi } from '../../services/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/admin/dashboard";

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const loginMutation = useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            navigate(from, { replace: true });
        },
        onError: (err) => {
            setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
        }
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
        <div className="min-h-screen flex w-full font-sans bg-slate-950 text-slate-200">
            {/* Left Side - Visuals (Monochrome Tech) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>

                {/* Subtle Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between p-20">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure Access
                        </div>
                        <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
                            Enterprise <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Resource Planning</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-sm leading-relaxed border-l-2 border-slate-800 pl-6">
                            Advanced resource allocation, project forecasting, and workforce analytics in one platform.
                        </p>
                    </div>

                    <div className="text-xs text-slate-600 font-mono">
                        v2.4.0-stable build.2024
                    </div>
                </div>
            </div>

            {/* Right Side - Dark Theme Login */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-950 relative">
                <div className="absolute top-0 right-0 p-8 flex gap-4">
                    <button onClick={() => navigate('/login/pm')} className="text-sm text-slate-400 hover:text-white transition-colors">
                        PM Portal →
                    </button>
                    <button onClick={() => navigate('/login/employee')} className="text-sm text-slate-400 hover:text-white transition-colors">
                        Employee Portal →
                    </button>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <img src="/logo.png" alt="Autonex" className="h-12 mx-auto mb-8 opacity-90" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Console</h2>
                        <p className="text-slate-500 text-sm mt-2">Authenticate to continue</p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-3 text-sm text-red-400 bg-red-900/10 border border-red-900/20 rounded-md">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-200 placeholder:text-slate-600 text-sm"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-200 placeholder:text-slate-600 text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_10px_rgb(79_70_229_/_0.2)]"
                            >
                                {loginMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Sign In</>
                                )}
                            </button>
                        </form>

                        {/* Credential Hint */}
                        <div className="pt-6 border-t border-slate-900 text-center">
                            <p className="text-xs text-slate-600">Demo Access: <span className="text-slate-400 font-mono ml-2">admin@autonex.com</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
