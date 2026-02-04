/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentProjectApi, employeeApi } from '../services/api';
import { Plus, X, Edit, Trash2, FolderTree, Users, Calendar, Clock, ChevronRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ParentProjectsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const queryClient = useQueryClient();

    // Fetch parent projects
    const { data: parentProjects = [], isLoading } = useQuery({
        queryKey: ['parent-projects'],
        queryFn: parentProjectApi.getAll,
    });

    // Fetch employees for PM dropdown
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: employeeApi.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: parentProjectApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['parent-projects']);
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => parentProjectApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['parent-projects']);
            setIsModalOpen(false);
            setEditingProject(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: parentProjectApi.delete,
        onSuccess: () => queryClient.invalidateQueries(['parent-projects']),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            name: formData.get('name'),
            client: formData.get('client') || null,
            program_manager_id: formData.get('program_manager_id') ? parseInt(formData.get('program_manager_id')) : null,
            description: formData.get('description') || null,
            global_start_date: formData.get('global_start_date'),
            tentative_duration_months: formData.get('tentative_duration_months') ? parseInt(formData.get('tentative_duration_months')) : null,
            status: formData.get('status') || 'active',
        };

        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            completed: 'bg-blue-100 text-blue-700 border border-blue-200',
            archived: 'bg-slate-100 text-slate-600 border border-slate-200',
        };
        return styles[status] || styles.active;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Projects
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage main projects and long-term initiatives
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingProject(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {/* Programs Grid */}
            {parentProjects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Layers className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Projects Yet</h3>
                    <p className="text-slate-500 mb-6">Create your first project to organize related sub-projects.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parentProjects.map((program) => (
                        <div
                            key={program.id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <FolderTree className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {program.name}
                                        </h3>
                                        {program.client && (
                                            <p className="text-xs text-slate-500">{program.client}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(program.status)}`}>
                                    {program.status}
                                </span>
                            </div>

                            {/* Description */}
                            {program.description && (
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                    {program.description}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <FolderTree className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                                    <p className="text-lg font-bold text-slate-800">{program.sub_projects_count || 0}</p>
                                    <p className="text-xs text-slate-500">Sub-Projects</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <Calendar className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                                    <p className="text-sm font-semibold text-slate-800">
                                        {program.global_start_date ? format(new Date(program.global_start_date), 'MMM yy') : '-'}
                                    </p>
                                    <p className="text-xs text-slate-500">Start</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 text-center">
                                    <Clock className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                                    <p className="text-lg font-bold text-slate-800">{program.tentative_duration_months || '-'}</p>
                                    <p className="text-xs text-slate-500">Months</p>
                                </div>
                            </div>

                            {/* PM Info */}
                            {program.program_manager_name && (
                                <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-50 rounded-lg">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm text-indigo-700 font-medium">
                                        PM: {program.program_manager_name}
                                    </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingProject(program);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Delete "${program.name}"? Sub-projects will be unlinked.`)) {
                                                deleteMutation.mutate(program.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <Link
                                    to={`/admin/sub-projects?project=${program.id}`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    View Sub-Projects
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingProject ? 'Edit Project' : 'Create Project'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingProject(null);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    defaultValue={editingProject?.name || ''}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g., Yutori"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Client
                                </label>
                                <input
                                    type="text"
                                    name="client"
                                    defaultValue={editingProject?.client || ''}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Client organization name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Program Manager
                                </label>
                                <select
                                    name="program_manager_id"
                                    defaultValue={editingProject?.program_manager_id || ''}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select PM</option>
                                    {employees.filter(e => e.status === 'active' && e.designation === 'Program Manager').map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    defaultValue={editingProject?.description || ''}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Scope of work and program objectives..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="global_start_date"
                                        required
                                        defaultValue={editingProject?.global_start_date || ''}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Duration (months)
                                    </label>
                                    <input
                                        type="number"
                                        name="tentative_duration_months"
                                        min="1"
                                        defaultValue={editingProject?.tentative_duration_months || ''}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="12"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    defaultValue={editingProject?.status || 'active'}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingProject(null);
                                    }}
                                    className="px-4 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending
                                        ? 'Saving...'
                                        : editingProject
                                            ? 'Update Project'
                                            : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentProjectsPage;
