import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';

export interface Project {
  projectId: string;
  buName: string;
  projectName: string;
  brand: string;
  approvedCount: number;
  allocatedCount: number;
  projectValue: number;
  brandLogo?: string | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

@Component({
  selector: 'app-projects-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.css']
})
export class ProjectEditComponent implements OnInit {
  editForm!: FormGroup;
  project?: Project;
  projectId!: string;
  logoFile?: File | null = null;
  logoPreview?: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: ProjectService
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      buName: [{ value: '', disabled: true }, Validators.required],
      projectId: [{ value: '', disabled: true }],
      projectName: ['', Validators.required],
      brand: ['', Validators.required],
      approvedCount: [0, [Validators.min(0)]],
      projectValue: [0, [Validators.min(0)]],
      projectStartDate: ['', Validators.required],
      projectEndDate: ['', Validators.required]
    });

    // Watch start date changes to adjust end date
    this.editForm.get('projectStartDate')!.valueChanges.subscribe(start => {
      const endControl = this.editForm.get('projectEndDate')!;
      if (endControl.value && new Date(endControl.value) < new Date(start)) {
        alert('End date cannot be before Start date. Adjusting End date automatically.');
        endControl.setValue(start);
      }
    });

    // Read projectId from route param
    const id = this.route.snapshot.paramMap.get('projectId') ?? '';
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }

    this.projectId = id;
    this.loadProject(id);
  }

  private loadProject(id: string) {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (p) => {
        this.project = p;

        const formatDate = (d?: string | null) => {
          if (!d) return '';
          const date = new Date(d);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };

        const startDate = formatDate(p.projectStartDate);
        const endDate = formatDate(p.projectEndDate);

        this.editForm.patchValue({
          buName: p.buName,
          projectId: p.projectId,
          projectName: p.projectName,
          brand: p.brand,
          approvedCount: p.approvedCount ?? 0,
          projectValue: p.projectValue ?? 0,
          projectStartDate: startDate,
          projectEndDate: endDate && new Date(endDate) < new Date(startDate) ? startDate : endDate
        });

        if (p.brandLogo) {
          this.logoPreview = 'data:image/*;base64,' + p.brandLogo;
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load project.');
        this.router.navigate(['/projects']);
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.logoFile);
    }
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // Check date validity again before submit
    const start = this.editForm.get('projectStartDate')!.value;
    const end = this.editForm.get('projectEndDate')!.value;
    if (new Date(end) < new Date(start)) {
      alert('End date cannot be before Start date.');
      return;
    }

    const fd = new FormData();

    fd.append('ProjectId', this.projectId);
    fd.append('BuName', this.editForm.get('buName')!.value);

    fd.append('ProjectName', this.editForm.get('projectName')!.value);
    fd.append('Brand', this.editForm.get('brand')!.value);
    fd.append('ApprovedCount', String(this.editForm.get('approvedCount')!.value));
    fd.append('ProjectValue', String(this.editForm.get('projectValue')!.value));

    const formatDateTime = (d: string) => d ? d + 'T00:00:00' : '';

    fd.append('ProjectStartDate', formatDateTime(start));
    fd.append('ProjectEndDate', formatDateTime(end));

    if (this.logoFile) fd.append('BrandLogo', this.logoFile, this.logoFile.name);
  
    this.loading = true;
    this.svc.update(this.projectId, fd).subscribe({
      next: () => {
        this.loading = false;
        alert(`${this.project?.projectId} - ${this.project?.projectName} updated successfully`);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        const msg = err?.error?.message || 'Failed to update project.';
        alert(msg);
      }
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
