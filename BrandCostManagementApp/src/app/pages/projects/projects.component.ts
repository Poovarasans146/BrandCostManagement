// src/app/pages/projects/projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DatePipe, CurrencyPipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  bus = ['IMS', 'FSS', 'CSS'];
  selectedBU = '';
  projects: Project[] = [];
  selectedProject?: Project;
  showForm = false;
  isEdit = false;
  form!: FormGroup;
  logoFile?: File;
  loading = false;

  constructor(private svc: ProjectService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      buName: ['', Validators.required],
      projectId: [{ value: '', disabled: true }],
      projectName: ['', Validators.required],
      brand: ['', Validators.required],
      approvedCount: [0, [Validators.required, Validators.min(0)]],
      projectValue: [0, [Validators.required, Validators.min(0)]],
      projectStartDate: [''],
      projectEndDate: ['']
    });
  }

  // Use ngModelChange so selection is immediate
  onSelectBU(bu: string) {
    if (!bu) {
      this.projects = [];
      this.selectedProject = undefined;
      return;
    }
    this.loading = true;
    this.svc.getByBU(bu).subscribe({
      next: list => {
        this.projects = list || [];
        this.selectedProject = undefined;
        this.loading = false;
      },
      error: _ => { this.projects = []; this.loading = false; }
    });
  }

  openCreate() {
    this.showForm = true;
    this.isEdit = false;
    this.form.reset();
    this.form.patchValue({ buName: this.selectedBU || '' });
    if (this.selectedBU) {
      this.svc.nextProjectId(this.selectedBU).subscribe(r => {
        // backend returns { next: 'IMS000002' } or string - handle both
        const next = (r && (r.next || r)) as any;
        this.form.patchValue({ projectId: next });
      }, () => { });
    }
  }

  onLogoSelected(e: any) {
    this.logoFile = e.target.files?.[0];
  }

  submitCreate() {
    if (this.form.invalid) return;
    const fd = new FormData();
    const pid = this.form.get('projectId')?.value;
    fd.append('ProjectId', pid);
    fd.append('BuName', this.form.value.buName);
    fd.append('ProjectName', this.form.value.projectName);
    fd.append('Brand', this.form.value.brand);
    fd.append('ApprovedCount', (this.form.value.approvedCount || 0).toString());
    fd.append('ProjectValue', (this.form.value.projectValue || 0).toString());
    if (this.logoFile) fd.append('BrandLogo', this.logoFile);
    if (this.form.value.projectStartDate) fd.append('ProjectStartDate', this.form.value.projectStartDate);
    if (this.form.value.projectEndDate) fd.append('ProjectEndDate', this.form.value.projectEndDate);

    this.svc.create(fd).subscribe({
      next: () => { this.onSelectBU(this.selectedBU); this.showForm = false; },
      error: e => alert('Create failed: ' + (e?.error?.message || e.message || 'server error'))
    });
  }

  selectProject(p: Project) {
    // single click selects and displays below
    this.selectedProject = p;
  }

  openEdit(p: Project) {
    // navigate to edit page (separate page like employees)
    this.router.navigate(['/projects/edit', p.projectId]);
  }
}