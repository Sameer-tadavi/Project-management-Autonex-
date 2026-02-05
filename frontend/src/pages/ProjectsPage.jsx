// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { projectApi, employeeApi } from '../services/api';
// import { Plus, Edit, Trash2, X, UserCheck, Users } from 'lucide-react';
// import { format } from 'date-fns';

// const ProjectsPage = () => {
//   const queryClient = useQueryClient();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);
//   const [skillsInput, setSkillsInput] = useState('');
//   const [matchingEmployeesCount, setMatchingEmployeesCount] = useState(0);
//   const [editingAllocation, setEditingAllocation] = useState(null);

//   const { data: projects = [], isLoading } = useQuery({
//     queryKey: ['projects'],
//     queryFn: projectApi.getAll,
//   });

//   const { data: employees = [] } = useQuery({
//     queryKey: ['employees'],
//     queryFn: employeeApi.getAll,
//   });

//   const createMutation = useMutation({
//     mutationFn: projectApi.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['projects']);
//       setIsModalOpen(false);
//       setSkillsInput('');
//       setMatchingEmployeesCount(0);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => projectApi.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['projects']);
//       setIsModalOpen(false);
//       setEditingProject(null);
//       setEditingAllocation(null);
//       setSkillsInput('');
//       setMatchingEmployeesCount(0);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: projectApi.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['projects']);
//     },
//   });

//   // Calculate matching employees when skills input changes
//   useEffect(() => {
//     if (skillsInput) {
//       const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
//       const matching = employees.filter(emp => 
//         emp.status === 'active' && 
//         skills.some(skill => 
//           emp.skills?.some(empSkill => 
//             empSkill.toLowerCase().includes(skill.toLowerCase())
//           )
//         )
//       );
//       setMatchingEmployeesCount(matching.length);
//     } else {
//       setMatchingEmployeesCount(0);
//     }
//   }, [skillsInput, employees]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);

//     const startDate = formData.get('start_date');
//     const endDate = formData.get('end_date');

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
//     const durationWeeks = Math.ceil(durationDays / 7);

//     const data = {
//       name: formData.get('name'),
//       client: formData.get('client'),
//       project_type: formData.get('project_type'),
//       total_tasks: parseInt(formData.get('total_tasks')),
//       estimated_time_per_task: parseFloat(formData.get('estimated_time_per_task')),
//       start_date: startDate,
//       end_date: endDate,
//       daily_target: parseInt(formData.get('daily_target')) || 0,
//       priority: formData.get('priority'),
//       required_expertise: formData.get('required_expertise').split(',').map(s => s.trim()).filter(Boolean),
//       project_duration_weeks: durationWeeks,
//       project_duration_days: durationDays,
//       project_status: formData.get('project_status') || 'active',
//     };

//     if (editingProject) {
//       updateMutation.mutate({ id: editingProject.id, data });
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const handleAllocationEdit = (project) => {
//     setEditingAllocation(project);
//   };

//   const handleAllocationSave = (projectId, newAllocation) => {
//     const project = projects.find(p => p.id === projectId);
//     updateMutation.mutate({
//       id: projectId,
//       data: {
//         ...project,
//         allocated_employees: parseInt(newAllocation),
//       }
//     });
//   };

//   const calculateManpower = (project) => {
//     const matchingEmployees = employees.filter(emp => 
//       emp.status === 'active' && 
//       project.required_expertise?.some(skill => 
//         emp.skills?.some(empSkill => 
//           empSkill.toLowerCase().includes(skill.toLowerCase())
//         )
//       )
//     );
//     return matchingEmployees.length;
//   };

//   const calculateManpowerBalance = (project) => {
//     const total = employees.filter(emp => emp.status === 'active').length;
//     const allocated = project.allocated_employees || 0;
//     return total - allocated;
//   };

//   const calculateTasksPerEmployee = (project) => {
//     const manpower = calculateManpower(project);
//     if (manpower === 0) return 0;
//     return Math.round(project.total_tasks / manpower);
//   };

//   const getSystemRecommendation = (project) => {
//     const totalHours = project.total_tasks * project.estimated_time_per_task;
//     const durationDays = project.project_duration_days || 1;
//     const workHoursPerDay = 8;
//     const workTime = durationDays * workHoursPerDay;

//     if (totalHours > workTime * 0.8) {
//       return 'Overburden';
//     } else if (totalHours > workTime * 0.6) {
//       return 'Partial allocation';
//     } else if (totalHours < workTime * 0.3) {
//       return 'Underutilized';
//     } else {
//       return 'Well balanced';
//     }
//   };

//   const getProjectStatusColor = (project) => {
//     const recommendation = getSystemRecommendation(project);

//     // Red: Overburden or Underutilized
//     if (recommendation === 'Overburden' || recommendation === 'Underutilized') {
//       return 'badge-red';
//     }

//     // Green: Completed
//     if (project.project_status === 'completed') {
//       return 'badge-green';
//     }

//     // Yellow: In Progress (active)
//     if (project.project_status === 'active') {
//       return 'badge-yellow';
//     }

//     // Gray: Other statuses
//     return 'badge-gray';
//   };

//   const getPriorityBadge = (priority) => {
//     const badges = {
//       'low': 'badge-blue',
//       'medium': 'badge-yellow',
//       'high': 'badge-orange',
//       'critical': 'badge-red',
//     };
//     return badges[priority?.toLowerCase()] || 'badge-blue';
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-gray-500">Loading projects...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
//           <p className="mt-1 text-sm text-gray-500">Manage and track all projects</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingProject(null);
//             setSkillsInput('');
//             setMatchingEmployeesCount(0);
//             setIsModalOpen(true);
//           }}
//           className="btn btn-primary flex items-center"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Project
//         </button>
//       </div>

//       <div className="card p-0">
//         <div className="overflow-x-auto">
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Project</th>
//                 <th>Client</th>
//                 <th>Skills Required</th>
//                 <th>Total Tasks</th>
//                 <th>Timeline</th>
//                 <th>Priority</th>
//                 <th>Avg Time/Task</th>
//                 <th>Manpower</th>
//                 <th>Tasks/Employee</th>
//                 <th>System Recommendation</th>
//                 <th>Allocations</th>
//                 <th>Manpower Balance</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.length === 0 ? (
//                 <tr>
//                   <td colSpan="14" className="text-center py-12 text-gray-500">
//                     No projects yet. Create your first project to get started.
//                   </td>
//                 </tr>
//               ) : (
//                 projects.map((project) => {
//                   const manpower = calculateManpower(project);
//                   const tasksPerEmp = calculateTasksPerEmployee(project);
//                   const recommendation = getSystemRecommendation(project);
//                   const manpowerBalance = calculateManpowerBalance(project);

//                   return (
//                     <tr key={project.id}>
//                       <td>
//                         <div className="font-medium text-gray-900">{project.name}</div>
//                         <div className="text-xs text-gray-500">{project.project_type}</div>
//                       </td>
//                       <td className="text-gray-700">{project.client}</td>
//                       <td>
//                         <div className="flex flex-wrap gap-1">
//                           {project.required_expertise?.slice(0, 2).map((skill, idx) => (
//                             <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
//                               {skill}
//                             </span>
//                           ))}
//                           {project.required_expertise?.length > 2 && (
//                             <span className="text-xs text-gray-500">+{project.required_expertise.length - 2}</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="font-medium text-gray-900">{project.total_tasks}</td>
//                       <td>
//                         <div className="text-sm text-gray-700">
//                           {format(new Date(project.start_date), 'MMM d')} - {format(new Date(project.end_date), 'MMM d, yyyy')}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {project.project_duration_weeks}w ({project.project_duration_days}d)
//                         </div>
//                       </td>
//                       <td>
//                         <span className={`badge ${getPriorityBadge(project.priority)}`}>
//                           {project.priority}
//                         </span>
//                       </td>
//                       <td className="font-medium text-gray-700">{project.estimated_time_per_task}h</td>
//                       <td>
//                         <div className="text-center">
//                           <div className="font-semibold text-gray-900">{manpower}</div>
//                           <div className="text-xs text-gray-500">available</div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="text-center">
//                           <div className="font-semibold text-gray-900">{tasksPerEmp}</div>
//                           <div className="text-xs text-gray-500">per emp</div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="text-xs">
//                           {recommendation === 'Overburden' && (
//                             <span className="badge badge-red">Overburden</span>
//                           )}
//                           {recommendation === 'Underutilized' && (
//                             <span className="badge badge-red">Underutilized</span>
//                           )}
//                           {recommendation === 'Partial allocation' && (
//                             <span className="badge badge-yellow">Partial</span>
//                           )}
//                           {recommendation === 'Well balanced' && (
//                             <span className="badge badge-green">Balanced</span>
//                           )}
//                         </div>
//                       </td>
//                       <td>
//                         {editingAllocation?.id === project.id ? (
//                           <div className="flex items-center gap-1">
//                             <input
//                               type="number"
//                               min="0"
//                               defaultValue={project.allocated_employees || 0}
//                               className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                               onKeyDown={(e) => {
//                                 if (e.key === 'Enter') {
//                                   handleAllocationSave(project.id, e.target.value);
//                                 } else if (e.key === 'Escape') {
//                                   setEditingAllocation(null);
//                                 }
//                               }}
//                               autoFocus
//                             />
//                             <button
//                               onClick={() => setEditingAllocation(null)}
//                               className="text-gray-400 hover:text-gray-600"
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => handleAllocationEdit(project)}
//                             className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300"
//                           >
//                             <Users className="w-4 h-4" />
//                             <span className="font-medium">{project.allocated_employees || 0}</span>
//                             <Edit className="w-3 h-3 text-gray-400" />
//                           </button>
//                         )}
//                       </td>
//                       <td>
//                         <div className="text-center">
//                           <div className={`font-semibold ${manpowerBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
//                             {manpowerBalance}
//                           </div>
//                           <div className="text-xs text-gray-500">remaining</div>
//                         </div>
//                       </td>
//                       <td>
//                         <span className={`badge ${getProjectStatusColor(project)}`}>
//                           {project.project_status}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="flex items-center gap-1">
//                           <button
//                             onClick={() => {
//                               setEditingProject(project);
//                               setSkillsInput(project.required_expertise?.join(', ') || '');
//                               setIsModalOpen(true);
//                             }}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                             title="Edit project"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => {
//                               if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
//                                 deleteMutation.mutate(project.id);
//                               }
//                             }}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded"
//                             title="Delete project"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {editingProject ? 'Edit Project' : 'Create New Project'}
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setIsModalOpen(false);
//                     setEditingProject(null);
//                     setSkillsInput('');
//                     setMatchingEmployeesCount(0);
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-5">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Project Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     required
//                     defaultValue={editingProject?.name}
//                     className="input"
//                     placeholder="Enter project name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Client <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="client"
//                     required
//                     defaultValue={editingProject?.client}
//                     className="input"
//                     placeholder="Enter client name"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Project Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="project_type"
//                     required
//                     defaultValue={editingProject?.project_type || 'Full'}
//                     className="input"
//                   >
//                     <option value="PoC">PoC</option>
//                     <option value="Full">Full</option>
//                     <option value="Side">Side</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Priority <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="priority"
//                     required
//                     defaultValue={editingProject?.priority || 'medium'}
//                     className="input"
//                   >
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                     <option value="critical">Critical</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Status <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="project_status"
//                     required
//                     defaultValue={editingProject?.project_status || 'active'}
//                     className="input"
//                   >
//                     <option value="active">In Progress</option>
//                     <option value="completed">Completed</option>
//                     <option value="on-hold">On Hold</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Total Tasks <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     name="total_tasks"
//                     required
//                     min="1"
//                     defaultValue={editingProject?.total_tasks || ''}
//                     className="input"
//                     placeholder="0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Time per Task (hours) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     name="estimated_time_per_task"
//                     required
//                     step="0.1"
//                     min="0.1"
//                     defaultValue={editingProject?.estimated_time_per_task || ''}
//                     className="input"
//                     placeholder="0.0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Daily Target
//                   </label>
//                   <input
//                     type="number"
//                     name="daily_target"
//                     min="0"
//                     defaultValue={editingProject?.daily_target || ''}
//                     className="input"
//                     placeholder="Optional"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Start Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     name="start_date"
//                     required
//                     defaultValue={editingProject?.start_date}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     End Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     name="end_date"
//                     required
//                     defaultValue={editingProject?.end_date}
//                     className="input"
//                   />
//                 </div>
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
//                 <p className="text-sm text-blue-800">
//                   Project duration will be calculated automatically from the dates above.
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Required Skills (comma-separated)
//                 </label>
//                 <input
//                   type="text"
//                   name="required_expertise"
//                   value={skillsInput}
//                   onChange={(e) => setSkillsInput(e.target.value)}
//                   className="input"
//                   placeholder="e.g., Python, Data Annotation, Quality Assurance"
//                 />
//                 {matchingEmployeesCount > 0 && (
//                   <div className="mt-2 flex items-center gap-2 text-sm">
//                     <UserCheck className="w-4 h-4 text-green-600" />
//                     <span className="text-green-700 font-medium">
//                       {matchingEmployeesCount} employee{matchingEmployeesCount !== 1 ? 's' : ''} with matching skills available
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsModalOpen(false);
//                     setEditingProject(null);
//                     setSkillsInput('');
//                     setMatchingEmployeesCount(0);
//                   }}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={createMutation.isPending || updateMutation.isPending}
//                   className="btn btn-primary"
//                 >
//                   {createMutation.isPending || updateMutation.isPending
//                     ? 'Saving...'
//                     : editingProject
//                     ? 'Update Project'
//                     : 'Create Project'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectsPage;

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subProjectApi, projectApi, employeeApi, skillApi, allocationApi } from '../services/api';
import { Plus, Edit, Trash2, X, UserCheck, Users, ChevronDown, ArrowRight, Copy } from 'lucide-react';
import { format } from 'date-fns';

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
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
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
    const durationWeeks = Math.ceil(durationDays / 7);

    const employeesRequired = parseInt(formData.get('employees_required')) || 0;

    const data = {
      name: formData.get('name'),
      main_project_id: parseInt(formData.get('main_project_id')) || null,
      project_type: formData.get('project_type'),
      total_tasks: parseInt(formData.get('total_tasks')),
      estimated_time_per_task: parseFloat(formData.get('estimated_time_per_task')),
      start_date: startDate,
      end_date: endDate,
      daily_target: parseInt(formData.get('daily_target')) || 0,
      priority: formData.get('priority'),
      required_expertise: formData.get('required_expertise').split(',').map(s => s.trim()).filter(Boolean),
      assigned_employee_ids: [],
      required_manpower: employeesRequired,  // Required employees count
      // NOTE: allocated_employees is NOT sent - it's computed by backend from allocations table
      project_duration_weeks: durationWeeks,
      project_duration_days: durationDays,
      project_status: formData.get('project_status') || 'active',
    };

    console.log('Submitting project data:', data);
    console.log('Employees required:', employeesRequired);

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      // Both create and copy use create mutation
      createMutation.mutate(data);
    }
  };

  // Get employees who match the required skills for this project
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

  // Get allocated manpower by counting actual allocation records (source of truth)
  const getAllocatedManpower = (project) => {
    return allocations.filter(a => a.sub_project_id === project.id).length;
  };

  // Calculate manpower balance (matching employees available - allocated)
  const calculateManpowerBalance = (project) => {
    const matchingTotal = getMatchingEmployees(project).length;
    const allocatedCount = getAllocatedManpower(project);
    return matchingTotal - allocatedCount;
  };

  // Calculate optimal employees needed
  const calculateOptimalManpower = (project) => {
    const totalHours = project.total_tasks * project.estimated_time_per_task;
    const durationDays = project.project_duration_days || 1;
    const workHoursPerDay = 8;
    const availableHoursPerEmployee = durationDays * workHoursPerDay;

    return Math.ceil(totalHours / availableHoursPerEmployee);
  };

  const calculateTasksPerEmployee = (project) => {
    const manpower = calculateManpower(project);
    if (manpower === 0) return 0;
    return Math.round(project.total_tasks / manpower);
  };

  /**
   * Binary System Recommendation Algorithm
   * 
   * Formula: Workload per Person = (Total Tasks / Allocated Personnel) × Avg Time per Task
   * 
   * Logic:
   * - If Workload per Person > Standard Working Hours → "Overburdened"
   * - If Workload per Person ≤ Standard Working Hours → "Underutilized"
   * 
   * Test Case: 250 tasks, 11 personnel, 0.5 hrs/task, 8 hrs standard
   * = (250 / 11) * 0.5 ≈ 11.36 hours → "Overburdened" ✓
   */
  const getSystemRecommendation = (project) => {
    const allocatedPersonnel = getAllocatedManpower(project);
    const totalTasks = project.total_tasks || 0;
    const avgTimePerTask = project.estimated_time_per_task || 0;
    const standardWorkingHours = 8.0;

    // Edge case: No employees allocated
    if (allocatedPersonnel === 0) {
      return 'Overburdened'; // Cannot complete tasks without personnel
    }

    // Calculate workload per person
    const tasksPerPerson = totalTasks / allocatedPersonnel;
    const requiredHoursPerPerson = tasksPerPerson * avgTimePerTask;

    // Binary decision: Overburdened or Underutilized
    if (requiredHoursPerPerson > standardWorkingHours) {
      return 'Overburdened';
    } else {
      return 'Underutilized';
    }
  };

  const getRecommendationBadge = (recommendation) => {
    if (recommendation === 'Overburdened') return 'badge-red';
    if (recommendation === 'Underutilized') return 'badge-green';
    return 'badge-gray';
  };

  const getProjectStatusColor = (project) => {
    const recommendation = getSystemRecommendation(project);

    if (recommendation === 'Overburdened') {
      return 'badge-red';
    }

    if (project.project_status === 'completed') {
      return 'badge-green';
    }

    if (project.project_status === 'active') {
      return 'badge-yellow';
    }

    return 'badge-gray';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'low': 'badge-blue',
      'medium': 'badge-yellow',
      'high': 'badge-orange',
      'critical': 'badge-red',
    };
    return badges[priority?.toLowerCase()] || 'badge-blue';
  };

  const [searchParams] = useSearchParams();
  const filterMainProjectId = searchParams.get('project');

  // Filter projects based on the URL parameter
  const filteredProjects = filterMainProjectId
    ? projects.filter(p => p.main_project_id === parseInt(filterMainProjectId))
    : projects;

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
      {/* Page Header */}
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

      {/* Modern Card Container */}
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
                  const recommendation = getSystemRecommendation(project);

                  return (
                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                      {/* Sub-Project Name */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{project.name}</div>
                        <div className="text-xs text-slate-400">{project.project_type}</div>
                      </td>

                      {/* Parent Project */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {mainProjects.find(p => p.id === project.main_project_id)?.name || '—'}
                        </span>
                      </td>

                      {/* Project Manager - from parent project */}
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

                      {/* Skills */}
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

                      {/* Total Manpower */}
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{matchingTotal}</div>
                        <div className="text-xs text-slate-400">available</div>
                      </td>

                      {/* Allocated - Shows action button if not allocated, or status if allocated */}
                      <td className="px-5 py-4 text-center">
                        {allocatedManpower > 0 ? (
                          // Already allocated - show green badge with link
                          <button
                            onClick={() => navigate('/admin/allocations', { state: { projectId: project.id } })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm transition-colors border border-emerald-200"
                            title="View/Manage Allocations"
                          >
                            <span>Allocated</span>
                            <span className="font-bold">{allocatedManpower}</span>
                          </button>
                        ) : (
                          // Not allocated - show matching count as action button
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

                      {/* Remaining */}
                      <td className="px-5 py-4 text-center">
                        <div className={`font-semibold ${remainingManpower < 0 ? 'text-red-600' : remainingManpower > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {remainingManpower}
                        </div>
                        <div className="text-xs text-slate-400">
                          {remainingManpower >= 0 ? 'available' : 'exceeded'}
                        </div>
                      </td>

                      {/* Tasks */}
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{project.total_tasks}</div>
                      </td>

                      {/* Timeline */}
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {format(new Date(project.start_date), 'MMM d')} — {format(new Date(project.end_date), 'MMM d')}
                        </div>
                        <div className="text-xs text-slate-400">{project.project_duration_weeks}w ({project.project_duration_days}d)</div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${project.priority === 'High' ? 'bg-red-50 text-red-700' :
                          project.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {project.priority}
                        </span>
                      </td>

                      {/* Avg Time */}
                      <td className="px-5 py-4 text-center">
                        <div className="font-medium text-slate-700">{project.estimated_time_per_task}h</div>
                      </td>

                      {/* Tasks/Emp with Impact Indicator */}
                      <td className="px-5 py-4 text-center">
                        <div className="font-semibold text-slate-800">{tasksPerEmp}</div>
                        <div className="text-xs text-slate-400">per emp</div>
                        {allocatedManpower > 0 && (
                          <div className="mt-1 text-xs space-y-0.5">
                            {/* Impact if 1 employee is removed */}
                            <div className="text-red-500" title="If you remove 1 employee, each person handles this many tasks">
                              Remove 1 → {Math.round(project.total_tasks / (allocatedManpower - 1 || 1))}/person
                            </div>
                            {/* Impact if 1 employee is added */}
                            <div className="text-emerald-500" title="If you add 1 employee, each person handles this many tasks">
                              Add 1 → {Math.round(project.total_tasks / (allocatedManpower + 1))}/person
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Recommendation with Workload Hours */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${recommendation === 'Overburdened' ? 'bg-red-50 text-red-700' :
                            recommendation === 'Underutilized' ? 'bg-emerald-50 text-emerald-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                            {recommendation}
                          </span>
                          {allocatedManpower > 0 && (
                            <div className="text-xs text-slate-500">
                              {((project.total_tasks / allocatedManpower) * project.estimated_time_per_task).toFixed(1)}h / 8h per day
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${project.project_status === 'active' ? 'bg-emerald-500' :
                            project.project_status === 'completed' ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`}></span>
                          <span className="text-sm text-slate-600 capitalize">{project.project_status}</span>
                        </div>
                      </td>

                      {/* Actions */}
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
                }
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
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
                      className="input"
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
                      Time per Task (hours) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimated_time_per_task"
                      required
                      step="0.1"
                      min="0.1"
                      defaultValue={(editingProject || copyingProject)?.estimated_time_per_task || ''}
                      className="input"
                      placeholder="0.0"
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
      )
      }
    </div >
  );
};

export default ProjectsPage;