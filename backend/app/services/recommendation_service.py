"""
Intelligent Recommendation Service
Calculates real capacity using actual availability, removing hardcoded assumptions.
Implements the algorithm from Module 3 of Autonex Architecture V2.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict

from app.models.parent_project import ParentProject  # Import first for relationship
from app.models.project import Project
from app.models.allocation import Allocation
from app.models.leave import Leave
from app.models.employee import Employee


class RecommendationEngine:
    """
    Calculates project capacity based on:
    - Project timeline (working days only)
    - Employee allocations with active date ranges
    - Leave records
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def _is_weekend(self, d: date) -> bool:
        """Check if date is a weekend (Saturday=5, Sunday=6)."""
        return d.weekday() >= 5
    
    def _get_working_days(self, start: date, end: date) -> List[date]:
        """Generate list of working days (excluding weekends) between dates."""
        working_days = []
        current = start
        while current <= end:
            if not self._is_weekend(current):
                working_days.append(current)
            current += timedelta(days=1)
        return working_days
    
    def _is_date_in_leave(self, check_date: date, leaves: List[Leave]) -> bool:
        """Check if a date falls within any leave record."""
        for leave in leaves:
            if leave.start_date and leave.end_date:
                if leave.start_date <= check_date <= leave.end_date:
                    return True
        return False
    
    def _is_date_in_allocation_range(
        self,
        check_date: date,
        alloc: Allocation,
        project_start: date,
        project_end: date
    ) -> bool:
        """
        Check if date is within allocation's active range.
        Uses project dates as fallback if allocation has no specific range.
        """
        alloc_start = alloc.active_start_date or project_start
        alloc_end = alloc.active_end_date or project_end
        return alloc_start <= check_date <= alloc_end
    
    def calculate_project_capacity(self, project_id: int) -> Dict[str, Any]:
        """
        Main algorithm: Calculate real capacity for a project.
        
        Algorithm Steps:
        1. Generate timeline array (project.start_date to project.end_date)
        2. For each Date in Timeline:
           - Skip if Weekend
           - For each Employee in Allocation List:
             * Check if Date within their active_date_range
             * Check if Date inside any Leave_Record
             * Add Employee.total_daily_hours to net_capacity
        3. Calculate utilization ratio
        """
        # Get project
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"error": f"Project with ID {project_id} not found"}
        
        # Get all allocations for this project
        allocations = self.db.query(Allocation).filter(
            Allocation.sub_project_id == project_id
        ).all()
        
        if not allocations:
            return {
                "project_id": project_id,
                "project_name": project.name,
                "total_estimated_hours": project.total_tasks * project.estimated_time_per_task,
                "net_capacity": 0,
                "working_days": len(self._get_working_days(project.start_date, project.end_date)),
                "utilization_ratio": 999.0,  # Indicates infinite/no capacity
                "status": "no_allocations",
                "recommendations": ["No team members allocated to this project"],
                "daily_breakdown": []
            }
        
        # Get employee IDs and their leave records
        employee_ids = [a.employee_id for a in allocations]
        leaves_by_employee = defaultdict(list)
        
        all_leaves = self.db.query(Leave).filter(
            Leave.employee_id.in_(employee_ids)
        ).all()
        
        for leave in all_leaves:
            leaves_by_employee[leave.employee_id].append(leave)
        
        # Get employee details
        employees = {
            e.id: e for e in self.db.query(Employee).filter(
                Employee.id.in_(employee_ids)
            ).all()
        }
        
        # Step 1: Generate timeline
        working_days = self._get_working_days(project.start_date, project.end_date)
        
        # Step 2: Daily sweep
        net_capacity = 0
        daily_breakdown = []
        
        for work_date in working_days:
            day_capacity = 0
            day_details = {
                "date": work_date.isoformat(),
                "employees": []
            }
            
            for alloc in allocations:
                employee = employees.get(alloc.employee_id)
                if not employee:
                    continue
                
                # Check 1: Is date within allocation's active range?
                if not self._is_date_in_allocation_range(
                    work_date, alloc, project.start_date, project.end_date
                ):
                    continue
                
                # Check 2: Is date inside any leave record?
                if self._is_date_in_leave(work_date, leaves_by_employee[alloc.employee_id]):
                    day_details["employees"].append({
                        "employee_id": alloc.employee_id,
                        "employee_name": employee.name,
                        "hours": 0,
                        "status": "on_leave"
                    })
                    continue
                
                # Add hours to capacity
                hours = alloc.total_daily_hours or int(alloc.weekly_hours_allocated or 0) // 5 or 8
                day_capacity += hours
                day_details["employees"].append({
                    "employee_id": alloc.employee_id,
                    "employee_name": employee.name,
                    "hours": hours,
                    "status": "available"
                })
            
            day_details["total_hours"] = day_capacity
            daily_breakdown.append(day_details)
            net_capacity += day_capacity
        
        # Step 3: Calculate utilization ratio
        total_estimated_hours = project.total_tasks * project.estimated_time_per_task
        
        if net_capacity > 0:
            utilization_ratio = total_estimated_hours / net_capacity
        else:
            utilization_ratio = 999.0  # Indicates infinite/no capacity
        
        # Determine status based on thresholds
        if utilization_ratio > 1.1:
            status = "overburdened"
            recommendations = [
                f"Team is overloaded by {round((utilization_ratio - 1) * 100)}%",
                "Consider adding more team members",
                "Review project scope for potential reduction"
            ]
        elif utilization_ratio >= 0.7:
            status = "balanced"
            recommendations = [
                "Resource allocation is well balanced",
                f"Team has {round((1 - utilization_ratio) * 100)}% buffer capacity"
            ]
        elif utilization_ratio >= 0.5:
            status = "underutilized"
            recommendations = [
                f"Team has {round((1 - utilization_ratio) * 100)}% unused capacity",
                "Consider reassigning team members to other projects"
            ]
        else:
            status = "significantly_underutilized"
            recommendations = [
                f"Team utilization is only {round(utilization_ratio * 100)}%",
                "Major reallocation recommended"
            ]
        
        return {
            "project_id": project_id,
            "project_name": project.name,
            "total_estimated_hours": total_estimated_hours,
            "net_capacity": net_capacity,
            "working_days": len(working_days),
            "total_calendar_days": (project.end_date - project.start_date).days + 1,
            "utilization_ratio": round(utilization_ratio, 3),
            "status": status,
            "team_size": len(allocations),
            "leaves_impact": sum(
                1 for day in daily_breakdown
                for emp in day["employees"]
                if emp["status"] == "on_leave"
            ),
            "recommendations": recommendations,
            "daily_breakdown": daily_breakdown[:7]  # Return first week only for summary
        }
    
    def get_dashboard_overview(self) -> Dict[str, Any]:
        """
        Get capacity overview for all active projects.
        Returns summary suitable for dashboard display.
        """
        projects = self.db.query(Project).filter(
            Project.project_status == "active"
        ).all()
        
        overview = {
            "total_projects": len(projects),
            "overburdened": [],
            "balanced": [],
            "underutilized": []
        }
        
        for project in projects:
            result = self.calculate_project_capacity(project.id)
            if "error" not in result:
                summary = {
                    "project_id": project.id,
                    "project_name": project.name,
                    "utilization_ratio": result["utilization_ratio"],
                    "status": result["status"],
                    "team_size": result.get("team_size", 0)
                }
                
                if result["status"] in ["overburdened"]:
                    overview["overburdened"].append(summary)
                elif result["status"] in ["balanced"]:
                    overview["balanced"].append(summary)
                else:
                    overview["underutilized"].append(summary)
        
        return overview
