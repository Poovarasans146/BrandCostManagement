import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';

import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService, MeResponse } from '../services/auth.service';
 
interface Project {

  projectId: string;

  buName: string;

  projectName: string;

  brand: string;

  approvedCount: number;

  allocatedCount: number;

  projectValue: number;

  brandLogo?: string | null;

  projectStartDate?: string;

  projectEndDate?: string;

}
 
@Component({

  selector: 'app-projects',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterModule, DatePipe, CurrencyPipe],

  templateUrl: './projects.html',

  styleUrls: ['./projects.css']

})

export class ProjectsComponent implements OnInit {

  bus = ['IMS', 'FSS', 'CSS'];

  selectedBU = '';

  projects: Project[] = [];

  selectedProject?: Project;

  loading = false;

  errorMessage = '';

  searchLabel = '';
 
  userRole: string = 'viewer';

  allowedEditRoles = ['admin', 'manager'];
 
  apiUrl = 'http://localhost:5157/api/projects';
 
  constructor(

    private http: HttpClient,

    private router: Router,

    private authService: AuthService,

    private ngZone: NgZone,

    private cd: ChangeDetectorRef  // ✅ Add ChangeDetectorRef

  ) {}
 
  ngOnInit(): void {

    this.userRole = localStorage.getItem('userRole') || 'viewer';

    this.authService.getMe().subscribe({

      next: (res: MeResponse) => {

        const role = res?.role || this.userRole;

        localStorage.setItem('userRole', role);

        this.ngZone.run(() => (this.userRole = role));

      },

      error: () => {

        this.userRole = localStorage.getItem('userRole') || 'viewer';

      }

    });

  }
 
  private getAuthHeader(): HttpHeaders {

    const token = localStorage.getItem('jwt') || '';

    return new HttpHeaders({ Authorization: `Bearer ${token}` });

  }
 
  searchProjects() {

    if (!this.selectedBU) return;
 
    this.searchLabel = `${this.selectedBU} Brands`;

    this.loading = true;

    this.errorMessage = '';

    this.projects = [];

    this.selectedProject = undefined;
 
    this.http.get<Project[]>(`${this.apiUrl}/by-bu/${this.selectedBU}`, { headers: this.getAuthHeader() })

      .subscribe({

        next: (list) => {

          this.projects = list || [];

          this.loading = false;
 
          // ✅ Force Angular to detect change immediately

          this.cd.detectChanges();

        },

        error: (err) => {

          console.error('API error:', err);

          this.projects = [];

          this.loading = false;

          this.errorMessage = err?.error?.message || 'Failed to fetch projects';
 
          this.cd.detectChanges();

        }

      });

  }
 
  selectProject(p: Project) {

    this.selectedProject = p;

  }
 
  createProject() {

    this.router.navigate(['/projects/add']);

  }
 
  editProject(p: Project, event?: Event) {

    if (event) event.stopPropagation();

    if (!p?.projectId) return;
 
    if (!this.allowedEditRoles.includes(this.userRole.toLowerCase())) {

      alert('You do not have permission to edit this project.');

      return;

    }
 
    this.router.navigate([`/projects/edit/${p.projectId}`]);

  }

}

 