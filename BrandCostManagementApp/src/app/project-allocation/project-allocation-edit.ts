import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectAllocationService, ProjectAllocation,Employee,Project } from '../services/project-allocation.service';

@Component({
  selector: 'app-project-allocation-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-allocation-edit.html',
  styleUrls: ['./project-allocation.css']
})
export class ProjectAllocationEditComponent implements OnInit {
  allocationId!: number;
  allocationArray?: ProjectAllocation;
  allocations: ProjectAllocation[] = [];

  // Editable fields
  role: 'On Role' | 'Off Role' = 'On Role';
  allocation?: number;
  allocationStart?: string;
  allocationEnd?: string;
  previousAllocationStart?: string;
  previousAllocationEnd?: string;
    // For display
  employeeName = '';
  projectName = '';
  employeeId?: number;
  projectId?: string;
  selectedProjectId?: string;
  projectDetails?: Project;
 
  errorMessage = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private allocationService: ProjectAllocationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.allocationId = Number(this.route.snapshot.paramMap.get('id'));
    //console.log("allocation id: ", this.allocationId);
    if (this.allocationId) {
      this.fetchAllocation();
    }
    this.fetchAllocations(); 
  }

// 🔹 Fetch allocation details by ID using project-based endpoint
fetchAllocation() {
  this.loading = true;

  // You can dynamically get projectId from route or allocationId mapping.
  // For now we’ll use a fixed value like 'ims000001' — or replace it with a variable later.
  //const projectId = 'ims000001';

  this.allocationService.getByAllocation(this.allocationId).subscribe({
    next: (res) => {
      if (res) {
        this.allocationArray = res;                  // assign directly
        this.role = res.role as 'On Role' | 'Off Role';
        this.allocation = res.allocation;
        this.allocationStart = res.allocationStart?.substring(0, 10);
        this.allocationEnd = res.allocationEnd?.substring(0, 10);
        this.employeeId = res.employeeId;
        this.employeeName = res.employeeName || '';
        this.projectId = res.projectId;
        this.projectName = res.projectName || '';
      } else {
        this.errorMessage = 'Allocation not found.';
      }

      this.loading = false;
      this.cd.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Failed to fetch allocation.';
      this.loading = false;
      this.cd.detectChanges();
    }
  });

}


    // --- ✅ Fetch All Existing Allocations ---
  fetchAllocations() {
    this.allocationService.getAllAllocations().subscribe({
      next: (res) => {
        this.allocations = res || [];
        //console.log("✅ Existing Allocations Loaded: ", this.allocations);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch allocations';
      }
    });
  }

  // 🔹 Update allocation
  updateAllocation() {
    if (!this.allocation) return;

    if (!this.role || !this.allocation || !this.allocationStart || !this.allocationEnd) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    if (this.allocation < 1 || this.allocation > 100) {
      alert('⚠️ Allocation must be between 1 and 100.');
      return;
    }

        // ✅ Calculate total allocation for this employee
      const employeeAllocations = this.allocations.filter(a => 
        a.employee?.employeeId === this.employeeId && a.projectAllocationId !== this.allocationId
      );
      const totalAllocated = employeeAllocations.reduce((sum, a) => sum + (a.allocation || 0), 0);
      const remaining = 100 - totalAllocated;
      // Debug info
      console.log(`Employee ${this.employeeName} current total: ${totalAllocated}%, remaining: ${remaining}%`);
      if ((this.allocation || 0) > remaining) {
        alert(`❌ Cannot assign ${this.allocation}%. Only ${remaining}% allocation remaining for this employee.`);
        return;
      }

    if (this.allocation < 1 || this.allocation > 100) {
      alert('Allocation must be between 1 and 100');
      return;
    }

    const projectAllocations = this.allocations.filter(a =>
      a.project?.projectId === this.projectId
    );

    if (projectAllocations.length > 0) {
    // Take the first (or latest) allocation entry for that project
      const project = projectAllocations[0].project;

      // ✅ Extract actual project start and end dates
      this.previousAllocationStart = project.projectStartDate?.substring(0, 10);
      this.previousAllocationEnd = project.projectEndDate?.substring(0, 10);

    } else {
      // No allocations found
      this.previousAllocationStart = '';
      this.previousAllocationEnd = '';
    }

    
    if (
      this.allocationStart &&
      this.allocationEnd &&
      this.allocationStart > this.allocationEnd
    ) {
      alert('You are selecting the Brand starting Date beyond the Brand ending Date.');
      return;
    }
   
    if (
      this.previousAllocationStart &&
      this.allocationStart &&
      this.allocationStart < this.previousAllocationStart
    ) {
      alert('You are selecting before the Brand Starting Date.');
      return;
    }

        // ✅ Ensure both dates exist before comparing
    if (
      this.previousAllocationEnd &&
      this.allocationEnd &&
      this.allocationEnd > this.previousAllocationEnd
    ) {
      alert('You are selecting beyond the Brand Ending Date.');
      return;
    }

    const payload: Partial<ProjectAllocation> = {
      projectAllocationId: this.allocationId,
      employeeId: this.employeeId,
      employeeName: this.employeeName,
      projectId: this.projectId,
      projectName: this.projectName,
      role: this.role,
      allocation: this.allocation,
      allocationStart: this.allocationStart,
      allocationEnd: this.allocationEnd
    };

    this.allocationService.update(this.allocationId, payload).subscribe({
      next: () => {
        console.log(payload);
        alert('✅ Allocation updated successfully!');
        this.router.navigate(['/project-allocation']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to update allocation.');
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/project-allocation']);
  }
}
