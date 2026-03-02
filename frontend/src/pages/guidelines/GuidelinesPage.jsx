import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidelineApi, projectApi } from '../../services/api';
import { FileText, Plus, Trash2, Edit3, X, Save, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const GuidelinesPage = () => {
    const queryClient = useQueryClient();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = localStorage.getItem('role') || 'employee';
    const canEdit = role === 'pm' || role === 'admin';

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', main_project_id: '', sub_project_id: '' });
    const [filterProject, setFilterProject] = useState('');

    // Fetch guidelines
    const params = {};
    if (filterProject) params.main_project_id = filterProject;
    const { data: guidelines = [], isLoading } = useQuery({
        queryKey: ['guidelines', filterProject],
        queryFn: () => guidelineApi.getAll(params),
    });

    // Fetch main projects for filter/selector
    const { data: mainProjects = [] } = useQuery({
        queryKey: ['main-projects'],
        queryFn: projectApi.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => guidelineApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
            toast.success('Guideline created!');
            resetForm();
        },
        onError: () => toast.error('Failed to create guideline'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => guidelineApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
            toast.success('Guideline updated!');
            resetForm();
        },
        onError: () => toast.error('Failed to update'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => guidelineApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
            toast.success('Guideline deleted');
        },
        onError: () => toast.error('Failed to delete'),
    });

    const resetForm = () => {
        setForm({ title: '', content: '', main_project_id: '', sub_project_id: '' });
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            title: form.title,
            content: form.content,
            main_project_id: form.main_project_id ? parseInt(form.main_project_id) : null,
            sub_project_id: form.sub_project_id ? parseInt(form.sub_project_id) : null,
            uploaded_by: user.id || null,
        };
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: { title: form.title, content: form.content } });
        } else {
            createMutation.mutate(payload);
        }
    };

    const startEdit = (g) => {
        setForm({ title: g.title, content: g.content || '', main_project_id: g.main_project_id || '', sub_project_id: g.sub_project_id || '' });
        setEditingId(g.id);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Project Guidelines</h1>
                    <p className="text-slate-500 text-sm mt-1">Reference documents and instructions for projects</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Guideline
                    </button>
                )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Projects</option>
                        {mainProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <span className="text-sm text-slate-400">{guidelines.length} guideline{guidelines.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Create/Edit Form */}
            {showForm && canEdit && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">{editingId ? 'Edit Guideline' : 'New Guideline'}</h3>
                        <button onClick={resetForm} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Annotation Standards"
                                    required
                                />
                            </div>
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Main Project</label>
                                    <select
                                        value={form.main_project_id}
                                        onChange={(e) => setForm({ ...form, main_project_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">None (General)</option>
                                        {mainProjects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                            <textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                rows={8}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                placeholder="Write guidelines in plain text or markdown..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Guidelines List */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading guidelines...</div>
            ) : guidelines.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-medium text-slate-600 mb-1">No guidelines yet</h3>
                    <p className="text-sm text-slate-400">{canEdit ? 'Click "Add Guideline" to create the first one.' : 'No guidelines have been published yet.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {guidelines.map(g => {
                        const project = mainProjects.find(p => p.id === g.main_project_id);
                        return (
                            <div key={g.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <h3 className="font-semibold text-slate-800">{g.title}</h3>
                                            </div>
                                            {project && (
                                                <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-600 rounded-full mb-2">
                                                    {project.name}
                                                </span>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => startEdit(g)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteMutation.mutate(g.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {g.content && (
                                        <div className="mt-3 p-4 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
                                            {g.content}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400 mt-3">
                                        Created {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GuidelinesPage;
