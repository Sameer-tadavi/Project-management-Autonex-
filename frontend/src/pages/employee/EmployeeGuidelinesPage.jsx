import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { guidelineApi, allocationApi, subProjectApi } from '../../services/api';
import { FileText } from 'lucide-react';

const EmployeeGuidelinesPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = user.employee_id;

    const { data: allocations = [] } = useQuery({
        queryKey: ['my-allocations', employeeId],
        queryFn: () => allocationApi.getByEmployee(employeeId),
        enabled: !!employeeId,
    });
    const { data: projects = [] } = useQuery({ queryKey: ['sub-projects'], queryFn: subProjectApi.getAll });
    const { data: allGuidelines = [], isLoading } = useQuery({ queryKey: ['guidelines'], queryFn: () => guidelineApi.getAll() });

    // Get main_project_ids of allocated projects
    const myProjectIds = new Set(allocations.map(a => a.sub_project_id));
    const myMainProjectIds = new Set(
        projects.filter(p => myProjectIds.has(p.id)).map(p => p.main_project_id).filter(Boolean)
    );

    // Filter guidelines to ones linked to my projects (or general ones with no project)
    const myGuidelines = allGuidelines.filter(g =>
        !g.main_project_id || myMainProjectIds.has(g.main_project_id)
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Project Guidelines</h1>
                <p className="text-slate-500 text-sm mt-1">Guidelines for your allocated projects</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading...</div>
            ) : myGuidelines.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No guidelines available</p>
                    <p className="text-sm text-slate-400 mt-1">Guidelines for your projects will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {myGuidelines.map(g => (
                        <div key={g.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <h3 className="font-semibold text-slate-800">{g.title}</h3>
                            </div>
                            {g.content && (
                                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
                                    {g.content}
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-3">
                                Created {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeGuidelinesPage;
