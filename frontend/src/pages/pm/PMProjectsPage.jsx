import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { subProjectApi, parentProjectApi, employeeApi, allocationApi, skillApi, leaveApi } from '../../services/api';
import { FolderTree, Users, Calendar, Clock, ChevronRight, Layers, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const PMProjectsPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeId = user.employee_id;
  const [searchParams] = useSearchParams();
  const filterMainProjectId = searchParams.get('project');

  // --- Data Queries ---
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

  // --- PM Filtering Logic ---
  const myParentProjects = mainProjects.filter(p => p.program_manager_id === employeeId);
  const myParentProjectIds = myParentProjects.map(p => p.id);

  // --- Helper functions (same as admin) ---
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

  const getWorkingDays = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count || 1;
  };

  const getEmployeeLeaveDays = (empId, projectStart, projectEnd) => {
    const empLeaves = leaves.filter(l => l.employee_id === empId);
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
    const avgTimePerTask = project.estimated_time_per_task || 0;
    const totalEstimatedHours = totalTasks * avgTimePerTask;

    if (allocatedPersonnel === 0) {
      return { label: 'Overburdened', dailyHours: 0, details: 'No employees allocated' };
    }

    const workingDays = getWorkingDays(project.start_date, project.end_date);

    let totalEffectiveEmployeeDays = 0;
    for (const alloc of projectAllocations) {
      const leaveDays = getEmployeeLeaveDays(alloc.employee_id, project.start_date, project.end_date);
      totalEffectiveEmployeeDays += (workingDays - leaveDays);
    }

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

  // =============================================
  // VIEW 1: Sub-Projects Table (when ?project=ID)
  // =============================================
  if (filterMainProjectId) {
    const currentMainProject = mainProjects.find(p => p.id === parseInt(filterMainProjectId));

    // Only allow viewing sub-projects of PM's own parent projects
    if (!myParentProjectIds.includes(parseInt(filterMainProjectId))) {
      return (
        <div className="space-y-6 p-2">
          <div className="text-center py-16 text-slate-400">
            <div className="text-lg font-medium">You don't have access to this project</div>
            <Link to="/pm/projects" className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block">
              ← Back to My Projects
            </Link>
          </div>
        </div>
      );
    }

    const filteredProjects = projects
      .filter(p => p.main_project_id === parseInt(filterMainProjectId))
      .sort((a, b) => a.id - b.id);

    return (
      <div className="space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/pm/projects"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              Sub-Projects for {currentMainProject?.name || 'Project'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage tasks and resource allocation for {currentMainProject?.name || 'this project'}
            </p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center py-16 text-slate-400">
                      <div className="text-lg font-medium">No sub-projects for this project</div>
                      <p className="text-sm mt-1">Sub-projects will appear here once they are created</p>
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm border border-emerald-200">
                              <span>Allocated</span>
                              <span className="font-bold">{allocatedManpower}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-medium text-sm border border-amber-200">
                              <span className="font-bold">{matchingTotal}</span>
                              <span>available</span>
                            </span>
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // VIEW 2: Parent Project Cards (default view)
  // =============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Projects assigned to you as Program Manager
          </p>
        </div>
      </div>

      {/* Project Cards Grid */}
      {myParentProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Projects Assigned</h3>
          <p className="text-slate-500">Projects will appear here once you are assigned as a Program Manager.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myParentProjects.map((program) => {
            const subProjectCount = projects.filter(p => p.main_project_id === program.id).length;

            return (
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
                    <p className="text-lg font-bold text-slate-800">{subProjectCount}</p>
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
                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                  <Link
                    to={`/pm/projects?project=${program.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Sub-Projects
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PMProjectsPage;
