// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { employeeApi } from '../services/api';
// import { Plus, Edit, Trash2, X, User } from 'lucide-react';

// const EmployeesPage = () => {
//   const queryClient = useQueryClient();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState(null);

//   const { data: employees = [], isLoading } = useQuery({
//     queryKey: ['employees'],
//     queryFn: employeeApi.getAll,
//   });

//   const createMutation = useMutation({
//     mutationFn: employeeApi.create,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['employees']);
//       setIsModalOpen(false);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => employeeApi.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['employees']);
//       setIsModalOpen(false);
//       setEditingEmployee(null);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: employeeApi.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries(['employees']);
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = {
//       name: formData.get('name'),
//       email: formData.get('email'),
//       employee_type: formData.get('employee_type'),
//       working_hours_per_day: parseFloat(formData.get('working_hours_per_day')),
//       weekly_availability: parseFloat(formData.get('weekly_availability')),
//       skills: formData.get('skills').split(',').map(s => s.trim()).filter(Boolean),
//       productivity_baseline: parseFloat(formData.get('productivity_baseline')),
//       status: formData.get('status') || 'active',
//     };

//     if (editingEmployee) {
//       updateMutation.mutate({ id: editingEmployee.id, data });
//     } else {
//       createMutation.mutate(data);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       'active': 'badge-green',
//       'inactive': 'badge-gray',
//       'on-leave': 'badge-yellow',
//     };
//     return badges[status?.toLowerCase()] || 'badge-blue';
//   };

//   const getTypeBadge = (type) => {
//     const badges = {
//       'Full-Time': 'badge-blue',
//       'Part-Time': 'badge-purple',
//       'Intern': 'badge-orange',
//     };
//     return badges[type] || 'badge-gray';
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-gray-500">Loading employees...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
//           <p className="mt-1 text-sm text-gray-500">Manage team members and their information</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingEmployee(null);
//             setIsModalOpen(true);
//           }}
//           className="btn btn-primary flex items-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           Add Employee
//         </button>
//       </div>

//       <div className="card p-0">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours/Day</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours/Week</th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Skills</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Productivity</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {employees.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="px-4 py-12 text-center">
//                     <div className="text-gray-400">
//                       <p className="mb-2">No employees yet</p>
//                       <p className="text-sm">Add your first team member to get started</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 employees.map((employee) => (
//                   <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//                           <User className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div className="min-w-0">
//                           <div className="font-medium text-sm text-gray-900 truncate">{employee.name}</div>
//                           <div className="text-xs text-gray-500 truncate">{employee.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <span className={`badge ${getTypeBadge(employee.employee_type)}`}>
//                         {employee.employee_type}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <div className="font-medium text-sm text-gray-900">{employee.working_hours_per_day}h</div>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <div className="font-medium text-sm text-gray-900">{employee.weekly_availability}h</div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex flex-wrap gap-1">
//                         {employee.skills && employee.skills.length > 0 ? (
//                           <>
//                             {employee.skills.slice(0, 3).map((skill, idx) => (
//                               <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
//                                 {skill}
//                               </span>
//                             ))}
//                             {employee.skills.length > 3 && (
//                               <span className="text-xs text-gray-500">+{employee.skills.length - 3}</span>
//                             )}
//                           </>
//                         ) : (
//                           <span className="text-xs text-gray-400">No skills</span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <span className={`badge ${employee.productivity_baseline === 1.0 ? 'badge-blue' : 'badge-green'}`}>
//                         {employee.productivity_baseline}x
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <span className={`badge ${getStatusBadge(employee.status)}`}>
//                         {employee.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-center gap-1">
//                         <button
//                           onClick={() => {
//                             setEditingEmployee(employee);
//                             setIsModalOpen(true);
//                           }}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                           title="Edit"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             if (window.confirm(`Delete ${employee.name}?`)) {
//                               deleteMutation.mutate(employee.id);
//                             }
//                           }}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {editingEmployee ? 'Edit Employee' : 'Add Employee'}
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setIsModalOpen(false);
//                     setEditingEmployee(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       required
//                       defaultValue={editingEmployee?.name}
//                       className="input"
//                       placeholder="John Doe"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       required
//                       defaultValue={editingEmployee?.email}
//                       className="input"
//                       placeholder="john@example.com"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Type <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="employee_type"
//                       required
//                       defaultValue={editingEmployee?.employee_type || 'Full-Time'}
//                       className="input"
//                     >
//                       <option value="Full-Time">Full-Time</option>
//                       <option value="Part-Time">Part-Time</option>
//                       <option value="Intern">Intern</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Hours/Day <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       name="working_hours_per_day"
//                       required
//                       step="0.5"
//                       min="1"
//                       max="24"
//                       defaultValue={editingEmployee?.working_hours_per_day || 8}
//                       className="input"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Hours/Week <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       name="weekly_availability"
//                       required
//                       step="0.5"
//                       min="1"
//                       max="168"
//                       defaultValue={editingEmployee?.weekly_availability || 40}
//                       className="input"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Productivity <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       name="productivity_baseline"
//                       required
//                       step="0.1"
//                       min="0.1"
//                       max="2.0"
//                       defaultValue={editingEmployee?.productivity_baseline || 1.0}
//                       className="input"
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Range: 0.1 - 2.0</p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="status"
//                       required
//                       defaultValue={editingEmployee?.status || 'active'}
//                       className="input"
//                     >
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                       <option value="on-leave">On Leave</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Skills (comma-separated)
//                   </label>
//                   <input
//                     type="text"
//                     name="skills"
//                     placeholder="Python, Data Analysis, Project Management"
//                     defaultValue={editingEmployee?.skills?.join(', ')}
//                     className="input"
//                   />
//                   <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
//                 </div> */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Skills
//                   </label>
//                   <div className="relative">
//                     <select
//                       name="skills"
//                       multiple
//                       defaultValue={editingEmployee?.skills || []}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
//                       size="5"
//                     >
//                       <option value="Data Annotation" className="py-2">Data Annotation</option>
//                       <option value="Development" className="py-2">Development</option>
//                       <option value="Robotics" className="py-2">Robotics</option>
//                       <option value="Product Management" className="py-2">Product Management</option>
//                       <option value="React" className="py-2">React</option>
//                     </select>
//                   </div>
//                   <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>

//                   <div className="mt-3">
//                     <input
//                       type="text"
//                       placeholder="Add custom skill..."
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           e.preventDefault();
//                           const value = e.target.value.trim();
//                           if (value) {
//                             const select = e.target.closest('div').previousElementSibling.previousElementSibling.querySelector('select');
//                             const option = new Option(value, value, false, true);
//                             select.add(option);
//                             e.target.value = '';
//                           }
//                         }
//                       }}
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Press Enter to add a new skill</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsModalOpen(false);
//                     setEditingEmployee(null);
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
//                     : editingEmployee
//                       ? 'Update Employee'
//                       : 'Create Employee'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeesPage;


import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, skillApi } from '../services/api';
import { Plus, Edit, Trash2, X, User, ChevronDown } from 'lucide-react';

// Custom Multi-Select Dropdown Component
const MultiSelectDropdown = ({ name, defaultValue = [], predefinedSkills, queryClient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(defaultValue);
  const [customSkill, setCustomSkill] = useState('');
  const [allSkills, setAllSkills] = useState(predefinedSkills);
  const dropdownRef = useRef(null);

  // Update allSkills when predefinedSkills changes
  useEffect(() => {
    setAllSkills(predefinedSkills);
  }, [predefinedSkills]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = async () => {
    const skill = customSkill.trim();
    if (skill && !allSkills.includes(skill)) {
      // Add to local state immediately
      setAllSkills(prev => [...prev, skill]);
      setSelectedSkills(prev => [...prev, skill]);
      setCustomSkill('');

      // Create skill in backend and refresh the list
      try {
        await skillApi.create({ name: skill });
        queryClient.invalidateQueries(['skills']);
      } catch (error) {
        console.error('Failed to create skill:', error);
        // Optionally show error to user
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Hidden input to submit form data */}
      <input
        type="hidden"
        name={name}
        value={selectedSkills.join(',')}
      />

      {/* Dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer flex items-center justify-between min-h-[42px]"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedSkills.length > 0 ? (
            selectedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Select skills...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {allSkills.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No skills available. Add one below!
              </div>
            ) : (
              allSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{skill}</span>
                </label>
              ))
            )}
          </div>

          {/* Add custom skill section */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Press Enter or click Add</p>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  // Fetch skills from API
  const { data: skillsData = [], isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.getAll,
  });

  // Extract skill names from the API response
  const predefinedSkills = skillsData.map(skill => skill.name);

  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['skills']); // Refresh skills in case new ones were added
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['skills']); // Refresh skills in case new ones were added
      setIsModalOpen(false);
      setEditingEmployee(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      employee_type: formData.get('employee_type'),
      designation: formData.get('designation') || 'Annotator',
      working_hours_per_day: parseFloat(formData.get('working_hours_per_day')),
      weekly_availability: parseFloat(formData.get('weekly_availability')),
      skills: formData.get('skills').split(',').map(s => s.trim()).filter(Boolean),
      productivity_baseline: parseFloat(formData.get('productivity_baseline')),
      status: formData.get('status') || 'active',
    };

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'badge-green',
      'inactive': 'badge-gray',
      'on-leave': 'badge-yellow',
    };
    return badges[status?.toLowerCase()] || 'badge-blue';
  };

  const getTypeBadge = (type) => {
    const badges = {
      'Full-Time': 'badge-blue',
      'Part-Time': 'badge-purple',
      'Intern': 'badge-orange',
    };
    return badges[type] || 'badge-gray';
  };

  if (isLoading || skillsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">Manage team members and their availability</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Modern Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Designation</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Hours/Day</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Skills</th>
                <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="text-slate-400">
                      <p className="text-lg font-medium mb-1">No employees yet</p>
                      <p className="text-sm">Add your first team member to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{employee.name}</div>
                          <div className="text-sm text-slate-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700">{employee.designation || 'Annotator'}</span>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${employee.employee_type === 'Full-time' ? 'bg-emerald-50 text-emerald-700' :
                        employee.employee_type === 'Part-time' ? 'bg-blue-50 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {employee.employee_type}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="px-5 py-4 text-center">
                      <div className="font-semibold text-slate-800">{employee.working_hours_per_day}h</div>
                    </td>

                    {/* Skills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.skills && employee.skills.length > 0 ? (
                          <>
                            {employee.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                            {employee.skills.length > 3 && (
                              <span className="text-xs text-slate-400">+{employee.skills.length - 3}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${employee.status === 'active' ? 'bg-emerald-500' :
                            employee.status === 'on-leave' ? 'bg-amber-500' :
                              'bg-slate-400'
                          }`}></span>
                        <span className="text-sm text-slate-600 capitalize">{employee.status}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${employee.name}?`)) {
                              deleteMutation.mutate(employee.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6" id="employee-form">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingEmployee?.name}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={editingEmployee?.email}
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="designation"
                        required
                        defaultValue={editingEmployee?.designation || 'Annotator'}
                        className="input"
                      >
                        <option value="Program Manager">Program Manager</option>
                        <option value="Annotator">Annotator</option>
                        <option value="Developer">Developer</option>
                        <option value="QA">QA</option>
                        <option value="Reviewer">Reviewer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="employee_type"
                        required
                        defaultValue={editingEmployee?.employee_type || 'Full-Time'}
                        className="input"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hours/Day <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="working_hours_per_day"
                        required
                        step="0.5"
                        min="1"
                        max="24"
                        defaultValue={editingEmployee?.working_hours_per_day || 8}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hours/Week <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="weekly_availability"
                        required
                        step="0.5"
                        min="1"
                        max="168"
                        defaultValue={editingEmployee?.weekly_availability || 40}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Productivity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="productivity_baseline"
                        required
                        step="0.1"
                        min="0.1"
                        max="2.0"
                        defaultValue={editingEmployee?.productivity_baseline || 1.0}
                        className="input"
                      />
                      <p className="mt-1 text-xs text-gray-500">Range: 0.1 - 2.0</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        required
                        defaultValue={editingEmployee?.status || 'active'}
                        className="input"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills
                    </label>
                    <MultiSelectDropdown
                      name="skills"
                      defaultValue={editingEmployee?.skills || []}
                      predefinedSkills={predefinedSkills}
                      queryClient={queryClient}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="employee-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn btn-primary"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingEmployee
                    ? 'Update Employee'
                    : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;