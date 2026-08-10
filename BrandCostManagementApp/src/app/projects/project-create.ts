import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Project {
  projectId: string;
  buName: string;
  projectName: string;
  brand: string;
  approvedCount: number;
  allocatedCount: number;
  projectValue: number;
  brandLogo?: File | null;
  //contractDocument?: File | null;
  contractDocument?: string | null;
  contractDocumentName?: string | null;
  projectStartDate?: string;
  projectEndDate?: string;
}

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-create.html',
  styleUrls: ['./projects.css']
})
export class ProjectCreateComponent implements OnInit {
  bus = ['IMS','FSS','CSS'];
  form!: FormGroup;
  logoFile?: File;
  contractFile?: File;

  apiUrl = 'http://localhost:5157/api/Projects'; // change to your backend

  constructor(private fb: FormBuilder, private http: HttpClient, public router: Router) {}

  ngOnInit() {
    this.form = this.fb.group({
      buName: ['', Validators.required],
      projectId: [{ value: '', disabled: true }],
      projectName: ['', Validators.required],
      brand: ['', Validators.required],
      approvedCount: [0, [Validators.required, Validators.min(0)]],
      projectValue: [0, [Validators.required, Validators.min(0)]],
      projectStartDate: ['', Validators.required],
      projectEndDate: ['', Validators.required]
    });

    // Ensure end date is always >= start date
    this.form.get('projectStartDate')!.valueChanges.subscribe(start => {
      const endControl = this.form.get('projectEndDate')!;
      if (endControl.value && new Date(endControl.value) < new Date(start)) {
        endControl.setValue(start);
      }
    });
  }

  getAuthHeader(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  generateNextId() {
    const bu = this.form.value.buName;
    if (!bu) return;

    this.http.get<{ next: string }>(`${this.apiUrl}/next-projectid/${bu}`, { headers: this.getAuthHeader() })
      .subscribe(r => this.form.patchValue({ projectId: r.next }));
  }

  onLogoSelected(event: any) {
    this.logoFile = event.target.files?.[0];
  }

  onContractSelected(event: any) {

    const file = event.target.files?.[0];

    if (!file) {
      this.contractFile = undefined;
      return;
    }
    if(file.size > 10 * 1024 * 1024)
    {
        alert('Maximum PDF size is 10 MB.');
        event.target.value='';
        this.contractFile=undefined;
        return;
    }

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      event.target.value = '';
      this.contractFile = undefined;
      return;
    }

    this.contractFile = file;
  }

submitCreate() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const start = this.form.value.projectStartDate;
  const end = this.form.value.projectEndDate;
  if (new Date(end) < new Date(start)) {
    alert('End date cannot be before Start date.');
    return;
  }

  const fd = new FormData();
  fd.append('ProjectId', this.form.get('projectId')?.value || '');
  fd.append('BuName', this.form.value.buName);
  fd.append('ProjectName', this.form.value.projectName);
  fd.append('Brand', this.form.value.brand);
  fd.append('ApprovedCount', (this.form.value.approvedCount || 0).toString());
  fd.append('ProjectValue', (this.form.value.projectValue || 0).toString());
  fd.append('ProjectStartDate', start + 'T00:00:00');
  fd.append('ProjectEndDate', end + 'T00:00:00');

  if (this.logoFile) fd.append('BrandLogo', this.logoFile, this.logoFile.name);

  if (this.contractFile) fd.append('ContractDocument', this.contractFile, this.contractFile.name);

  this.http.post(this.apiUrl, fd, { headers: this.getAuthHeader() })
    .subscribe({
      next: () => {
        const projectId = this.form.get('projectId')?.value;
        const buName = this.form.value.buName;
        alert(`Project ${projectId} created successfully`);
        this.router.navigate(['/projects']);
      },
      error: e => alert(e?.error?.message || 'Create failed')
    });
}



  cancel() {
    this.router.navigate(['/projects']);
  }
}
