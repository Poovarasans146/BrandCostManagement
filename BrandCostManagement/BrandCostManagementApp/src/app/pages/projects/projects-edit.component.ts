import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects-edit',
  standalone: true, // ✅ standalone component
  imports: [CommonModule, ReactiveFormsModule], // ✅ Add ReactiveFormsModule here
  templateUrl: './projects-edit.component.html',
  styleUrls: ['./projects-edit.component.css']
})
export class ProjectsEditComponent implements OnInit {
  form!: FormGroup;
  projectId!: string;
  project?: Project;
  logoFile?: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: ProjectService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      buName: [{ value: '', disabled: true }, Validators.required],
      projectId: [{ value: '', disabled: true }],
      projectName: ['', Validators.required],
      brand: ['', Validators.required],
      approvedCount: [0, [Validators.min(0)]],
      projectValue: [0, [Validators.min(0)]],
      projectStartDate: [''],
      projectEndDate: ['']
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || params.get('projectId') || '';
      if (!id) {
        this.router.navigate(['/projects']);
        return;
      }
      this.projectId = id;
      this.loadProject(id);
    });
  }

  private loadProject(id: string) {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (p) => {
        this.project = p;
        this.form.patchValue({
          buName: p.buName,
          projectId: p.projectId,
          projectName: p.projectName,
          brand: p.brand,
          approvedCount: p.approvedCount ?? 0,
          projectValue: p.projectValue ?? 0,
          projectStartDate: p.projectStartDate ? this.toInputDate(p.projectStartDate) : '',
          projectEndDate: p.projectEndDate ? this.toInputDate(p.projectEndDate) : ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load project.');
        this.router.navigate(['/projects']);
      }
    });
  }

  private toInputDate(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.logoFile = file;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    fd.append('ProjectName', this.form.get('projectName')!.value);
    fd.append('Brand', this.form.get('brand')!.value);
    fd.append('ApprovedCount', String(this.form.get('approvedCount')!.value ?? 0));
    fd.append('ProjectValue', String(this.form.get('projectValue')!.value ?? 0));

    const start = this.form.get('projectStartDate')!.value;
    const end = this.form.get('projectEndDate')!.value;
    if (start) fd.append('ProjectStartDate', start);
    if (end) fd.append('ProjectEndDate', end);

    if (this.logoFile) {
      fd.append('BrandLogo', this.logoFile, this.logoFile.name);
    }

    this.loading = true;
    this.svc.update(this.projectId, fd).subscribe({
      next: () => {
        this.loading = false;
        this.svc.clearCache();
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert(err?.error?.message || 'Failed to save project.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
