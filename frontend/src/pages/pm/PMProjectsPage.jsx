import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { allocationApi, subProjectApi } from '../../services/api';
import { FolderKanban, Clock, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const PMProjectsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = user.employee_id;

    const { data: projects = [], isLoading } = useQuery({ queryKey: ['sub-projects'], queryFn: subProjectApi.getAll });
    const { data: allocations = [] } = useQuery({ queryKey: ['allocations'], queryFn: allocationApi.getAll });

    // Find projects where PM is allocated or assigned
    const myAllocProjectIds = new Set(allocations.filter(a => a.employee_id === employeeId).map(a => a.sub_project_id));
    const myProjects = projects.filter(p =>
        myAllocProjectIds.has(p.id) ||
        (p.assigned_employee_ids && p.assigned_employee_ids.includes(employeeId))
    );

    // If PM has no specific allocations, show all active projects (PM can see all)
    const displayProjects = myProjects.length > 0 ? myProjects : projects.filter(p => p.project_status === 'active');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
                <p className="text-slate-500 text-sm mt-1">Daily sheets assigned to you</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading...</div>
            ) : displayProjects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No projects assigned</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayProjects.map(project => {
                        const projAllocs = allocations.filter(a => a.sub_project_id === project.id);
                        return (
                            <div key={project.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{project.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{project.client} • {project.project_type}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${project.project_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : project.project_status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>{project.project_status}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-500"><Users className="w-3.5 h-3.5" /> {projAllocs.length}/{project.required_manpower || '—'}</div>
                                    <div className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3.5 h-3.5" /> {project.total_tasks} tasks</div>
                                    <div className="text-right text-slate-400 text-xs font-mono">
                                        {project.end_date ? format(parseISO(project.end_date), 'MMM dd') : '—'}
                                    </div>
                                </div>
                                {/* Progress */}
                                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getProgress(project.start_date, project.end_date)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

function getProgress(start, end) {
    if (!start || !end) return 0;
    const s = new Date(start).getTime(), e = new Date(end).getTime(), now = Date.now();
    if (now >= e) return 100;
    if (now <= s) return 0;
    return Math.round(((now - s) / (e - s)) * 100);
}

export default PMProjectsPage;
