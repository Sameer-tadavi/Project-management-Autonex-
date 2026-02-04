import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const LoginForm = ({ role = 'admin' }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const isEmployee = role === 'employee';

    // Dynamic Styling based on role
    const linkClass = isEmployee ? 'text-brand-employee' : 'text-brand-admin';
    const buttonVariant = 'primary'; // We can customize Button more if needed, but primary is set to brand-admin. 
    // Let's override the button class for employee
    const buttonClass = isEmployee ? '!bg-brand-employee hover:!bg-brand-employee/90 focus:!ring-emerald-500' : '';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear errors when user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (serverError) setServerError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setServerError('');

        try {
            // MOCK API CALL - Replace with actual api.post('/login', ...)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

            // Simulate Successful Login
            // Create a mock token
            const mockToken = `mock-jwt-token-${role}-${Date.now()}`;
            localStorage.setItem('token', mockToken);
            localStorage.setItem('role', role);
            localStorage.setItem('user', JSON.stringify({ email: formData.email, role }));

            // Redirect
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }

        } catch (err) {
            console.error(err);
            setServerError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {role === 'admin' ? 'Admin' : 'Employee'}
                </h2>
                <p className="text-slate-500 mt-2">
                    Please sign in to access your dashboard
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {serverError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium text-center animate-in fade-in">
                        {serverError}
                    </div>
                )}

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={isLoading}
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        disabled={isLoading}
                    />
                    <div className="flex justify-end">
                        <a href="#" className={`text-xs font-medium hover:underline ${linkClass}`}>
                            Forgot password?
                        </a>
                    </div>
                </div>

                <Button
                    type="submit"
                    className={`w-full ${buttonClass}`}
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Sign in
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    Not {role}?{' '}
                    <a
                        href={role === 'admin' ? '/login/employee' : '/login/admin'}
                        className={`font-medium hover:underline ${linkClass}`}
                    >
                        Sign in as {role === 'admin' ? 'Employee' : 'Admin'}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
