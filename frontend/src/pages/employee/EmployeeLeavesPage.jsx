import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../../services/api';
import { Calendar, Plus, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const EmployeeLeavesPage = () => {
    const queryClient = useQueryClient();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = user.employee_id;
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });

    const { data: allLeaves = [], isLoading } = useQuery({
        queryKey: ['my-leaves', employeeId],
        queryFn: () => leaveApi.getAll({ employee_id: employeeId }),
        enabled: !!employeeId,
    });

    const createMutation = useMutation({
        mutationFn: (data) => leaveApi.create({ ...data, employee_id: employeeId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
            toast.success('Leave requested!');
            setShowForm(false);
            setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
        },
        onError: (err) => toast.error(err?.response?.data?.detail?.[0]?.msg || 'Failed to create leave'),
    });

    const statusStyles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Leaves</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and request time off</p>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Request Leave
                </button>
            </div>

            {/* Request Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">New Leave Request</h3>
                        <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                <option value="casual">Casual</option>
                                <option value="sick">Sick</option>
                                <option value="vacation">Vacation</option>
                                <option value="personal">Personal</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Optional reason" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Leaves List */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading...</div>
            ) : allLeaves.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No leave records</p>
                    <p className="text-sm text-slate-400 mt-1">Click "Request Leave" to submit a new request.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {allLeaves.map(leave => {
                        const status = leave.status || 'pending';
                        return (
                            <div key={leave.leave_id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${status === 'approved' ? 'bg-emerald-50' : status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'}`}>
                                        {status === 'approved' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                        {status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                                        {status === 'pending' && <Clock className="w-5 h-5 text-amber-600" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 capitalize">{leave.leave_type} Leave</p>
                                        <p className="text-xs text-slate-400">
                                            {format(parseISO(leave.start_date), 'MMM dd')} — {format(parseISO(leave.end_date), 'MMM dd, yyyy')}
                                            {leave.reason && ` • ${leave.reason}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status]}`}>{status}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EmployeeLeavesPage;
