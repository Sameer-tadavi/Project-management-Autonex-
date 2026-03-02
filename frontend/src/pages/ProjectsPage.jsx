import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subProjectApi, parentProjectApi, employeeApi, allocationApi, skillApi, leaveApi } from '../services/api';
import { Plus, Edit, Trash2, X, UserCheck, Users, ChevronDown, ArrowRight, Copy, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Employee Multi-Select Dropdown Component
const EmployeeMultiSelect = ({ name, defaultValue = [], employees, requiredSkills }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(defaultValue);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees by matching skills
  const matchingEmployees = employees.filter(emp => {
    if (emp.status !== 'active') return false;
    if (!requiredSkills || requiredSkills.length === 0) return true;

    return requiredSkills.some(skill =>
      emp.skills?.some(empSkill =>
        empSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  });

  // Get employees that don't match skills
  const otherEmployees = employees.filter(emp =>
    emp.status === 'active' && !matchingEmployees.includes(emp)
  );

  const toggleEmployee = (empId) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));

  return (
    <div ref={dropdownRef} className="relative">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(selectedEmployeeIds)}
      />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer flex items-center justify-between min-h-[42px]"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedEmployees.length > 0 ? (
            selectedEmployees.map((emp) => (
              <span
                key={emp.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200"
              >
                {emp.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Select employees...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{selectedEmployeeIds.length} selected</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {matchingEmployees.length > 0 && (
            <>
              <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Matching Skills ({matchingEmployees.length})
                  </span>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {matchingEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-start px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-l-2 border-green-500"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {otherEmployees.length > 0 && (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-600">
                  Other Available Employees ({otherEmployees.length})
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {otherEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-start px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {matchingEmployees.length === 0 && otherEmployees.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No active employees available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [copyingProject, setCopyingProject] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['sub-projects'],
    queryFn: subProjectApi.getAll,
  });

  const { data: mainProjects = [] } = useQuery({
    queryKey: ['parent-projects'],
    queryFn: parentProjectApi.getAll,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  const { data: skillsData = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.getAll,
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ['allocations'],
    queryFn: allocationApi.getAll,
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: subProjectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['sub-projects']);
      setIsModalOpen(false);
      setCopyingProject(null);
      setSkillsInput('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => subProjectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sub-projects']);
      setIsModalOpen(false);
      setEditingProject(null);
      setSkillsInput('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subProjectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['sub-projects']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const startDate = formData.get('start_date');
    const endDate = formData.get('end_date');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const durationWeeks = Math.floor(durationDays / 7);

    const employeesRequired = parseInt(formData.get('employees_required')) || 0;

    const data = {
      name: formData.get('name'),
      main_project_id: parseInt(formData.get('main_project_id')) || null,
      project_type: formData.get('project_type'),
      total_tasks: parseInt(formData.get('total_tasks')),
      estimated_time_per_task: (parseFloat(formData.get('estimated_time_per_task')) || 0) / 60, // Store as hours, input is minutes
      start_date: startDate,
      end_date: endDate,
      daily_target: parseInt(formData.get('daily_target')) || 0,
      priority: formData.get('priority'),
      required_expertise: formData.get('required_expertise').split(',').map(s => s.trim()).filter(Boolean),
      assigned_employee_ids: [],
      required_manpower: employeesRequired,
      project_duration_weeks: durationWeeks,
      project_duration_days: durationDays,
      project_status: formData.get('project_status') || 'active',
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getMatchingEmployees = (project) => {
    if (!project.required_expertise || project.required_expertise.length === 0) {
      return employees.filter(emp => emp.status === 'active');
    }

    return employees.filter(emp =>
      emp.status === 'active' &&
      project.required_expertise.some(skill =>
        emp.skills?.some(empSkill =>
          empSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  };

  const getAllocatedManpower = (project) => {
    return allocations.filter(a => a.sub_project_id === project.id).length;
  };

  const calculateManpowerBalance = (project) => {
    const matchingTotal = getMatchingEmployees(project).length;
    const allocatedCount = getAllocatedManpower(project);
    return matchingTotal - allocatedCount;
  };

  const calculateTasksPerEmployee = (project) => {
    const manpower = getAllocatedManpower(project);
    if (manpower === 0) return 0;
    return Math.round(project.total_tasks / manpower);
  };

  // Helper: count working days (exclude weekends) between two dates
  const getWorkingDays = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay(); // 0=Sun, 6=Sat
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count || 1; // at least 1 to avoid division by zero
  };

  // Helper: count leave working days for an employee during a project period
  const getEmployeeLeaveDays = (employeeId, projectStart, projectEnd) => {
    const empLeaves = leaves.filter(l => l.employee_id === employeeId);
    let totalLeaveDays = 0;
    for (const leave of empLeaves) {
      if (!leave.start_date || !leave.end_date) continue;
      const leaveStart = new Date(Math.max(new Date(leave.start_date), new Date(projectStart)));
      const leaveEnd = new Date(Math.min(new Date(leave.end_date), new Date(projectEnd)));
      if (leaveStart <= leaveEnd) {
        totalLeaveDays += getWorkingDays(leaveStart.toISOString().split('T')[0], leaveEnd.toISOString().split('T')[0]);
      }
    }
    return totalLeaveDays;
  };

  const getSystemRecommendation = (project) => {
    const projectAllocations = allocations.filter(a => a.sub_project_id === project.id);
    const allocatedPersonnel = projectAllocations.length;
    const totalTasks = project.total_tasks || 0;
    const avgTimePerTask = project.estimated_time_per_task || 0; // in hours
    const totalEstimatedHours = totalTasks * avgTimePerTask;

    if (allocatedPersonnel === 0) {
      return { label: 'Overburdened', dailyHours: 0, details: 'No employees allocated' };
    }

    const workingDays = getWorkingDays(project.start_date, project.end_date);

    // Calculate effective capacity: subtract leave days per employee
    let totalEffectiveEmployeeDays = 0;
    for (const alloc of projectAllocations) {
      const leaveDays = getEmployeeLeaveDays(alloc.employee_id, project.start_date, project.end_date);
      totalEffectiveEmployeeDays += (workingDays - leaveDays);
    }

    // Per-employee average daily required hours
    const avgDailyHoursPerEmployee = totalEffectiveEmployeeDays > 0
      ? totalEstimatedHours / totalEffectiveEmployeeDays
      : 999;

    let label;
    if (avgDailyHoursPerEmployee > 8.5) {
      label = 'Overburdened';
    } else if (avgDailyHoursPerEmployee >= 7.5) {
      label = 'Balanced';
    } else {
      label = 'Underutilized';
    }

    return { label, dailyHours: avgDailyHoursPerEmployee, workingDays, effectiveDays: totalEffectiveEmployeeDays };
  };

  const [searchParams] = useSearchParams();
  const filterMainProjectId = searchParams.get('project');

  const filteredProjects = (filterMainProjectId
    ? projects.filter(p => p.main_project_id === parseInt(filterMainProjectId))
    : projects
  ).sort((a, b) => a.id - b.id); // Sort by ID for sequential order

  const currentMainProject = mainProjects.find(p => p.id === parseInt(filterMainProjectId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentMainProject ? `Sub-Projects for ${currentMainProject.name}` : 'All Sub-Projects'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentMainProject
              ? `Manage tasks and resource allocation for ${currentMainProject.name}`
              : 'Manage tasks and resource allocation across all projects'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Projects
          </Link>
          <button
            onClick={() => {
              setEditingProject(null);
              setSkillsInput('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sub-Project
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sub-Project</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Parent</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Project Manager</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Skills</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Total MP</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Allocated</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Remaining</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timeline</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Time</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks/Emp</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Recommendation</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="15" className="text-center py-16 text-slate-400">
                    <div className="text-lg font-medium">
                      {filterMainProjectId ? 'No sub-projects for this project' : 'No sub-projects yet'}
                    </div>
                    <p className="text-sm mt-1">Create your first sub-project to get started</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const matchingTotal = getMatchingEmployees(project).length;
                  const allocatedManpower = getAllocatedManpower(project);
                  const remainingManpower = matchingTotal - allocatedManpower;
                  const tasksPerEmp = allocatedManpower > 0 ? Math.round(project.total_tasks / allocatedManpower) : 0;
                  const recResult = getSystemRecommendation(project);
                  const recommendation = recResult.label;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{project.name}</div>
                        <div className="text-xs text-slate-400">{project.project_type}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {mainProjects.find(p => p.id === project.main_project_id)?.name || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {(() => {
                            const mainProject = mainProjects.find(p => p.id === project.main_project_id);
                            if (!mainProject?.program_manager_id) return '—';
                            const pm = employees.find(e => e.id === mainProject.program_manager_id);
                            return pm?.name || '—';
                          })()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {project.required_expertise?.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {project.required_expertise?.length > 2 && (
                            <span className="text-xs text-slate-400">+{project.required_expertise.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{matchingTotal}</div>
                        <div className="text-xs text-slate-400">available</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {allocatedManpower > 0 ? (
                          <button
                            onClick={() => navigate('/admin/allocations', { state: { projectId: project.id } })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm transition-colors border border-emerald-200"
                            title="View/Manage Allocations"
                          >
                            <span>Allocated</span>
                            <span className="font-bold">{allocatedManpower}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/admin/allocations', { state: { projectId: project.id } })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium text-sm transition-colors border border-amber-200"
                            title={`${matchingTotal} employees available with matching skills - Click to allocate`}
                          >
                            <span className="font-bold">{matchingTotal}</span>
                            <span>available</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className={`font-semibold ${remainingManpower < 0 ? 'text-red-600' : remainingManpower > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {remainingManpower}
                        </div>
                        <div className="text-xs text-slate-400">
                          {remainingManpower >= 0 ? 'available' : 'exceeded'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{project.total_tasks}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {format(new Date(project.start_date), 'MMM d')} — {format(new Date(project.end_date), 'MMM d')}
                        </div>
                        <div className="text-xs text-slate-400">
                          {project.project_duration_days < 7 ? `${project.project_duration_days}d` : `${Math.floor(project.project_duration_days / 7)}w ${project.project_duration_days % 7}d`}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${project.priority === 'High' ? 'bg-red-50 text-red-700' :
                          project.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="font-medium text-slate-700">{Math.round((project.estimated_time_per_task || 0) * 60)}m</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{tasksPerEmp}</div>
                        <div className="text-xs text-slate-400">per emp</div>
                        {allocatedManpower > 0 && (
                          <div className="mt-1 text-xs space-y-0.5">
                            <div className="text-red-500" title="If you remove 1 employee, each person handles this many tasks">
                              Remove 1 → {Math.round(project.total_tasks / (allocatedManpower - 1 || 1))}/person
                            </div>
                            <div className="text-emerald-500" title="Add 1 employee">
                              Add 1 → {Math.round(project.total_tasks / (allocatedManpower + 1))}/person
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${recommendation === 'Overburdened' ? 'bg-red-50 text-red-700' :
                            recommendation === 'Balanced' ? 'bg-emerald-50 text-emerald-700' :
                              recommendation === 'Underutilized' ? 'bg-amber-50 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            {recommendation}
                          </span>
                          {allocatedManpower > 0 && (
                            <div className="text-xs text-slate-500">
                              {recResult.dailyHours < 999 ? `${recResult.dailyHours.toFixed(1)}h` : '—'}  / 8h per day
                              {recResult.workingDays && <span className="text-slate-400"> ({recResult.workingDays}wd)</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${project.project_status === 'active' ? 'bg-emerald-500' :
                            project.project_status === 'completed' ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`}></span>
                          <span className="text-sm text-slate-600 capitalize">{project.project_status}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setSkillsInput(project.required_expertise?.join(', ') || '');
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCopyingProject({
                                ...project,
                                name: `${project.name} (Copy)`,
                              });
                              setSkillsInput(project.required_expertise?.join(', ') || '');
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${project.name}"?`)) {
                                deleteMutation.mutate(project.id);
                              }
                            }}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? 'Edit Sub-Project' : copyingProject ? 'Copy Sub-Project' : 'Create New Sub-Project'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                    setCopyingProject(null);
                    setSkillsInput('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6 space-y-5" id="project-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={(editingProject || copyingProject)?.name}
                      className="input"
                      placeholder="Enter sub-project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="main_project_id"
                      required
                      defaultValue={(editingProject || copyingProject)?.main_project_id || filterMainProjectId || ''}
                      disabled={!!filterMainProjectId && !editingProject && !copyingProject}
                      className={`input ${filterMainProjectId && !editingProject && !copyingProject ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select a Project</option>
                      {mainProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="project_type"
                      required
                      defaultValue={(editingProject || copyingProject)?.project_type || 'Full'}
                      className="input"
                    >
                      <option value="PoC">PoC</option>
                      <option value="Full">Full</option>
                      <option value="Side">Side</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      required
                      defaultValue={(editingProject || copyingProject)?.priority || 'medium'}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="project_status"
                      required
                      defaultValue={(editingProject || copyingProject)?.project_status || 'active'}
                      className="input"
                    >
                      <option value="active">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Tasks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="total_tasks"
                      required
                      min="1"
                      defaultValue={(editingProject || copyingProject)?.total_tasks || ''}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time per Task (Minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimated_time_per_task"
                      required
                      min="1"
                      defaultValue={(editingProject || copyingProject)?.estimated_time_per_task ? Math.round(((editingProject || copyingProject).estimated_time_per_task) * 60) : ''}
                      className="input"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Target
                    </label>
                    <input
                      type="number"
                      name="daily_target"
                      min="0"
                      defaultValue={(editingProject || copyingProject)?.daily_target || ''}
                      className="input"
                      placeholder="Optional"
                    />
                  </div>
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
                      defaultValue={(editingProject || copyingProject)?.start_date}
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
                      defaultValue={(editingProject || copyingProject)?.end_date}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills (comma-separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="required_expertise"
                    required
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="input"
                    placeholder="e.g., Python, Data Annotation, Quality Assurance"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter skills to see available employees count below
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="employees_required"
                    required
                    min="1"
                    defaultValue={(editingProject || copyingProject)?.required_manpower || ''}
                    className="input"
                    placeholder="Enter number of employees needed"
                  />

                  {skillsInput && (() => {
                    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
                    const matchingCount = employees.filter(emp =>
                      emp.status === 'active' &&
                      skills.some(skill =>
                        emp.skills?.some(empSkill =>
                          empSkill.toLowerCase().includes(skill.toLowerCase())
                        )
                      )
                    ).length;

                    return (
                      <div className={`mt-2 p-3 rounded border ${matchingCount > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          <UserCheck className={`w-4 h-4 ${matchingCount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-sm font-medium ${matchingCount > 0 ? 'text-green-800' : 'text-red-800'}`}>
                            {matchingCount} employee{matchingCount !== 1 ? 's' : ''} available with matching skills
                          </span>
                        </div>
                        {matchingCount === 0 && (
                          <p className="text-xs text-red-600 mt-1 ml-6">
                            No employees found with the specified skills
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                  setCopyingProject(null);
                  setSkillsInput('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="project-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingProject
                    ? 'Update Sub-Project'
                    : 'Create Sub-Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;