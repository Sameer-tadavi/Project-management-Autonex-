import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi, employeeApi } from '../services/api';
import { Plus, X, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const LeavesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveApi.getAll,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: leaveApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves']);
      setIsModalOpen(false);
      setError('');
    },
    onError: (err) => {
      console.error('Create leave error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create leave';
      setError(errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: leaveApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.target);
    const employeeId = formData.get('employee_id');
    const startDate = formData.get('start_date');
    const endDate = formData.get('end_date');
    const leaveType = formData.get('leave_type');

    if (!employeeId || employeeId === '') {
      setError('Please select an employee');
      return;
    }

    const data = {
      employee_id: parseInt(employeeId),
      start_date: startDate,
      end_date: endDate,
      leave_type: leaveType,
    };

    createMutation.mutate(data);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : `Employee #${employeeId}`;
  };

  const getLeaveTypeBadge = (type) => {
    const badges = {
      'sick': 'bg-red-50 text-red-700',
      'vacation': 'bg-blue-50 text-blue-700',
      'personal': 'bg-purple-50 text-purple-700',
      'casual': 'bg-emerald-50 text-emerald-700',
      'emergency': 'bg-amber-50 text-amber-700',
    };
    return badges[type?.toLowerCase()] || 'bg-slate-100 text-slate-600';
  };

  const activeEmployees = employees.filter(e => e.status === 'active');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading leaves...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track employee leaves and absences</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Leave
        </button>
      </div>

      {/* Warning if no employees */}
      {activeEmployees.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            ⚠️ Please create at least one active employee before recording leaves.
          </p>
        </div>
      )}

      {/* Modern Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Leave Type</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Start Date</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">End Date</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="text-slate-400">
                      <p className="text-lg font-medium mb-1">No leaves recorded yet</p>
                      <p className="text-sm">Add a leave record to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const start = new Date(leave.start_date);
                  const end = new Date(leave.end_date);
                  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave.leave_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {getEmployeeName(leave.employee_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getLeaveTypeBadge(leave.leave_type)}`}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {format(start, 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {format(end, 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-lg font-semibold text-slate-800">
                          {duration}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{duration === 1 ? 'day' : 'days'}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this leave record?')) {
                              deleteMutation.mutate(leave.leave_id);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add Leave</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {activeEmployees.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No active employees available. Please create an active employee first.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employee_id"
                    required
                    className="input"
                    disabled={activeEmployees.length === 0}
                  >
                    <option value="">Select employee</option>
                    {activeEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.employee_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leave_type"
                    required
                    className="input"
                  >
                    <option value="">Select type</option>
                    <option value="casual">Casual</option>
                    <option value="sick">Sick</option>
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || activeEmployees.length === 0}
                  className="btn btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
