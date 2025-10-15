// src/app/pages/project-allocations/project-allocations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ProjectAllocationService } from '../../services/project-allocation.service';
import { EmployeeService } from '../../services/employee.service';
import { RouterModule } from '@angular/router';
import { Project } from '../../models/project.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-project-allocations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-allocations.component.html',
  styleUrls: ['./project-allocations.component.css']
})
export class ProjectAllocationsComponent implements OnInit {
  bus = ['IMS', 'FSS', 'CSS'];
  selectedBU = '';
  projects: Project[] = [];
  employees: Employee[] = [];
  assignments: any[] = [];
  selectedProject?: Project;
  form!: FormGroup;
  editingId?: number;

  constructor(
    private projectSvc: ProjectService,
    private allocSvc: ProjectAllocationService,
    private empSvc: EmployeeService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      role: ['On-role', Validators.required],
      bu: ['', Validators.required],
      projectId: ['', Validators.required],
      allocationPercent: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      allocationStart: [''],
      allocationEnd: ['']
    });

    // make sure the employee service method name matches your real service.
    // If your service exposes getAll() instead of getAllEmployees(), change this call accordingly.
    if ((this.empSvc as any).getAllEmployees) {
      (this.empSvc as any).getAllEmployees().subscribe((list: Employee[]) => this.employees = list || []);
    } else if ((this.empSvc as any).getAll) {
      (this.empSvc as any).getAll().subscribe((list: Employee[]) => this.employees = list || []);
    }
  }

  onBUChange(bu: string) {
    this.selectedBU = bu;
    if (!bu) { this.projects = []; return; }
    this.projectSvc.getByBU(bu).subscribe(list => this.projects = list || []);
  }

  onProjectSelect(projectId: string) {
    this.selectedProject = this.projects.find(p => p.projectId === projectId);
    if (!this.selectedProject) return;
    this.allocSvc.getByProject(projectId).subscribe(list => this.assignments = list || []);
  }

  createAssignment() {
    if (this.form.invalid) return;
    const project = this.projects.find(p => p.projectId === this.form.value.projectId);
    if (project?.projectEndDate && this.form.value.allocationEnd) {
      if (new Date(this.form.value.allocationEnd) > new Date(project.projectEndDate)) {
        alert('You are selecting beyond the Brand End Date.');
        return;
      }
    }

    const payload = {
      employeeId: Number(this.form.value.employeeId),
      projectId: this.form.value.projectId,
      allocation: Number(this.form.value.allocationPercent),
      allocationStart: this.form.value.allocationStart || null,
      allocationEnd: this.form.value.allocationEnd || null
    };

    this.allocSvc.create(payload).subscribe(() => {
      this.onProjectSelect(this.form.value.projectId);
      this.form.reset({ role: 'On-role', allocationPercent: 1 });
      // use form.value.projectId (payload has no projectId property in update case)
      this.projectSvc.recalcAllocated(this.form.value.projectId).subscribe(() => { }, () => { });
    });
  }

  editAssignment(a: any) {
    this.editingId = a.projectAllocationId;
    this.form.patchValue({
      employeeId: a.employeeId,
      projectId: a.projectId,
      allocationPercent: a.allocation,
      allocationStart: a.allocationStart,
      allocationEnd: a.allocationEnd,
      bu: (this.projects.find(p => p.projectId === a.projectId)?.buName || '')
    });
    const el = document.querySelector('form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  updateAssignment() {
    if (!this.editingId) return;
    const project = this.projects.find(p => p.projectId === this.form.value.projectId);
    if (project?.projectEndDate && this.form.value.allocationEnd) {
      if (new Date(this.form.value.allocationEnd) > new Date(project.projectEndDate)) {
        alert('You are selecting beyond the Brand End Date.');
        return;
      }
    }

    const payload = {
      employeeId: Number(this.form.value.employeeId),
      allocation: Number(this.form.value.allocationPercent),
      allocationStart: this.form.value.allocationStart || null,
      allocationEnd: this.form.value.allocationEnd || null
    };

    this.allocSvc.update(this.editingId, payload).subscribe(() => {
      this.onProjectSelect(this.form.value.projectId);
      this.editingId = undefined;
      this.form.reset({ role: 'On-role', allocationPercent: 1 });
      // recalc allocatedCounts using the projectId from the form (not from payload)
      this.projectSvc.recalcAllocated(this.form.value.projectId).subscribe(() => { }, () => { });
    }, err => alert('Update failed: ' + (err?.error?.message || err.message || 'server error')));
  }

  deleteAssignment(id?: number) {
    if (!id) return;
    if (!confirm('Delete assignment?')) return;
    this.allocSvc.delete(id).subscribe(() => {
      if (this.form.value.projectId) this.onProjectSelect(this.form.value.projectId);
      this.projectSvc.recalcAllocated(this.form.value.projectId).subscribe(() => { }, () => { });
    }, err => alert('Delete failed'));
  }
}