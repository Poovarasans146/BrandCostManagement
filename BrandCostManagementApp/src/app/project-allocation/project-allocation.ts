import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectAllocationService, ProjectAllocation, Project } from '../services/project-allocation.service';

@Component({
  selector: 'app-project-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './project-allocation.html',
  styleUrls: ['./project-allocation.css']
})
export class ProjectAllocationComponent implements OnInit {
  bus = ['IMS', 'FSS', 'CSS'];
  selectedBU = '';
  projects: Project[] = [];
  selectedProject?: Project;

  allocations: ProjectAllocation[] = [];
  loading = false;
  searchLabel = '';
  errorMessage = '';

  constructor(
    private allocationService: ProjectAllocationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {}

  // 🔹 Search projects by BU
  searchProjects() {
    if (!this.selectedBU) return;

    this.searchLabel = `${this.selectedBU} Brands`;
    this.loading = true;
    this.projects = [];
    this.selectedProject = undefined;
    this.allocations = [];

    this.allocationService.getProjectsByBU(this.selectedBU).subscribe({
      next: (res) => {
        this.projects = res || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch projects';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // 🔹 Click project card
  selectProject(project: Project) {
    this.selectedProject = project;
    this.allocations = [];
    if (!project.projectId) return;

    this.loading = true;
    this.allocationService.getByProject(project.projectId).subscribe({
      next: (res) => {
        this.allocations = res || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.allocations = [];
        this.loading = false;
        this.errorMessage = 'Failed to fetch allocations';
        this.cd.detectChanges();
      }
    });
  }

  // 🔹 Navigate to Create Allocation page
  createAllocation() {
    this.router.navigate(['/project-allocation/add']);
  }

  // 🔹 Navigate to Edit Allocation page
  editAllocation(allocation: ProjectAllocation) {
    if (!allocation.projectAllocationId) return;
    this.router.navigate([`/project-allocation/edit/${allocation.projectAllocationId}`]);
  }
}
