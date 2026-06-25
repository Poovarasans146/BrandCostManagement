import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectAllocationService, Employee, Project, ProjectAllocation } from '../services/project-allocation.service';

@Component({
  selector: 'app-project-allocation-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-allocation-add.html',
  styleUrls: ['./project-allocation.css']
})
export class ProjectAllocationAddComponent implements OnInit {
  employees: Employee[] = [];
  bus = ['IMS', 'FSS', 'CSS'];
  projects: Project[] = [];
  allocations: ProjectAllocation[] = [];

  selectedEmployeeId?: number;
  employeeDetails?: Employee;
  role: 'On Role' | 'Off Role' = 'On Role';
  selectedBU = '';
  selectedProjectId?: string;
  projectDetails?: Project;
  allocation?: number;
  allocationStart?: string;
  allocationEnd?: string;

  errorMessage = '';
  loading = false;

  constructor(
    private allocationService: ProjectAllocationService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchAllocations(); 
  }

  fetchEmployees() {
    this.allocationService.getEmployees().subscribe({
      next: (res) => {
        this.employees = res || [];
        //console.log("employee details: ", this.employeeDetails);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch employees';
      }
    });
  }

    // --- ✅ Fetch All Existing Allocations ---
  fetchAllocations() {
    this.allocationService.getAllAllocations().subscribe({
      next: (res) => {
        this.allocations = res || [];
        console.log("✅ Existing Allocations Loaded: ", this.allocations);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch allocations';
      }
    });
  }
  

  onEmployeeChange() {
    if (this.selectedEmployeeId !== undefined && this.selectedEmployeeId !== null) {
      this.selectedEmployeeId = Number(this.selectedEmployeeId);
      this.employeeDetails = this.employees.find(e => Number(e.employeeId) === this.selectedEmployeeId);
    }
  }

  onBUChange() {
    this.projects = [];
    this.selectedProjectId = undefined;
    this.projectDetails = undefined;

    if (!this.selectedBU) return;

    this.allocationService.getProjectsByBU(this.selectedBU).subscribe({
      next: (res) => {
        this.projects = res || [];
        console.log("project details: ", this.projects);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch projects';
      }
    });
  }

  onProjectChange() {
    this.projectDetails = this.projects.find(p => p.projectId === this.selectedProjectId);
  }

  createAllocation() {
    if (!this.selectedEmployeeId || !this.selectedProjectId || !this.allocation || !this.allocationStart || !this.allocationEnd) {
      alert('Please fill all required fields.');
      return;
    }

        // ✅ Calculate total allocation for this employee
      const employeeAllocations = this.allocations.filter(a => a.employee?.employeeId === this.selectedEmployeeId);
      const totalAllocated = employeeAllocations.reduce((sum, a) => sum + (a.allocation || 0), 0);
      const remaining = 100 - totalAllocated;
      console.log("allocated percentage: ", totalAllocated)
      if (this.allocation > remaining) {
        alert(`❌ Cannot assign ${this.allocation}%. Only ${remaining}% allocation remaining for this employee.`);
        return;
      }

    if (this.allocation < 1 || this.allocation > 100) {
      alert('Allocation must be between 1 and 100');
      return;
    }

    if(this.allocationStart > this.allocationEnd){
      alert('You are selecting the Brand starting Date beyond the Brand ending Date.');
      return;
    }

    if(this.projectDetails?.projectStartDate && this.allocationStart < this.projectDetails.projectStartDate){
      alert('You are selecting before the Brand starting Date.');
      return;
    }

    if (this.projectDetails?.projectEndDate && this.allocationEnd > this.projectDetails.projectEndDate) {
      alert('You are selecting beyond the Brand Ending Date.');
      return;
    }


    const payload: Partial<ProjectAllocation> = {
      employeeId: this.selectedEmployeeId,
      employeeName: this.employeeDetails?.name,
      projectId: this.selectedProjectId,
      projectName: this.projectDetails?.projectName,
      role: this.role,
      allocation: this.allocation,
      allocationStart: this.allocationStart,
      allocationEnd: this.allocationEnd
    };

    this.allocationService.create(payload).subscribe({
      next: () => {
        alert('✅ Project allocation created successfully!');
        this.router.navigate(['/project-allocation']);
      },
      error: (err) => {
        console.error(err.managerName);
        alert('❌ Failed to create allocation');
      }
    });
  }

  cancel() {
    this.router.navigate(['/project-allocation']);
  }
}
