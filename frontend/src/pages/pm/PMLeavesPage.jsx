import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi, allocationApi, employeeApi, subProjectApi } from '../../services/api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const PMLeavesPage = () => {
    const queryClient = useQueryClient();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = user.employee_id;

    const { data: allLeaves = [], isLoading } = useQuery({ queryKey: ['leaves'], queryFn: () => leaveApi.getAll() });
    const { data: allocations = [] } = useQuery({ queryKey: ['allocations'], queryFn: allocationApi.getAll });
    const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.getAll });
    const { data: projects = [] } = useQuery({ queryKey: ['sub-projects'], queryFn: subProjectApi.getAll });

    // Find PM's projects
    const myAllocIds = new Set(allocations.filter(a => a.employee_id === employeeId).map(a => a.sub_project_id));
    const myProjectIds = new Set(projects.filter(p =>
        myAllocIds.has(p.id) || (p.assigned_employee_ids && p.assigned_employee_ids.includes(employeeId))
    ).map(p => p.id));

    // Employee IDs allocated to PM's projects
    const teamEmployeeIds = new Set(allocations.filter(a => myProjectIds.has(a.sub_project_id)).map(a => a.employee_id));

    // If PM has no specific projects, show all leaves (PM can see all)
    const teamLeaves = teamEmployeeIds.size > 0
        ? allLeaves.filter(l => teamEmployeeIds.has(l.employee_id))
        : allLeaves;

    const approveMutation = useMutation({
        mutationFn: (id) => leaveApi.approve(id, user.id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); toast.success('Leave approved'); },
    });
    const rejectMutation = useMutation({
        mutationFn: (id) => leaveApi.reject(id, user.id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); toast.success('Leave rejected'); },
    });

    const statusStyles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Team Leaves</h1>
                <p className="text-slate-500 text-sm mt-1">Manage leave requests from your team</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading...</div>
            ) : teamLeaves.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No leave requests</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Dates</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teamLeaves.map(leave => {
                                    const emp = employees.find(e => e.id === leave.employee_id);
                                    const status = leave.status || 'pending';
                                    return (
                                        <tr key={leave.leave_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-slate-800">{emp?.name || `#${leave.employee_id}`}</p>
                                                <p className="text-xs text-slate-400">{emp?.designation || ''}</p>
                                            </td>
                                            <td className="px-5 py-3.5 capitalize text-sm text-slate-600">{leave.leave_type}</td>
                                            <td className="px-5 py-3.5 text-center text-sm text-slate-600 font-mono">
                                                {format(parseISO(leave.start_date), 'MMM dd')} — {format(parseISO(leave.end_date), 'MMM dd')}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
                                                    {status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                    {status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                {status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => approveMutation.mutate(leave.leave_id)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                        >Approve</button>
                                                        <button
                                                            onClick={() => rejectMutation.mutate(leave.leave_id)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                        >Reject</button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMLeavesPage;
