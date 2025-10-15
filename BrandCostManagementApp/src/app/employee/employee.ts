import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, MeResponse } from '../services/auth.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee.html',
})
export default class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  searchForm: FormGroup;
  isSearching = false;
  isImporting = false;
  userRole: string = 'viewer'; // default

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private cd:ChangeDetectorRef
  ) {
    this.searchForm = new FormGroup({
      employeeId: new FormControl('')
    });
  }

  ngOnInit(): void {
    // 1️⃣ Immediately read whatever role is already in localStorage
    this.userRole = localStorage.getItem('userRole') || 'viewer';

    // 2️⃣ Optional: call backend to verify session and refresh role
    this.authService.getMe().subscribe({
      next: (res: MeResponse) => {
        const verifiedRole = res?.role || this.userRole;
        localStorage.setItem('userRole', verifiedRole);

        // ensure Angular detects change
        this.ngZone.run(() => (this.userRole = verifiedRole));

        // Load initial data
        this.loadAllEmployees();
      },
      error: () => {
        this.ngZone.run(() => {
          this.userRole = localStorage.getItem('userRole') || 'viewer';
          this.loadAllEmployees();
        });
      }
    });
  }

  /** Returns true if logged user is admin */
  isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  /** Load all employees (default behavior) */
  loadAllEmployees(): void {
    this.isSearching = true;
    this.employeeService.searchEmployee('').subscribe({
      next: (data) => {
        this.employees = data;
        this.isSearching = false;
      },
      error: () => {
        this.employees = [];
        this.isSearching = false;
      }
    });
  }

  /** Called when Search button clicked */
  onSearch(): void {
    const code = this.searchForm.get('employeeId')?.value?.trim();
    if (!code) {
      alert('Please enter Employee ID or Name to search.');
      return;
    }

    this.isSearching = true;
    this.employeeService.searchEmployee(code).subscribe({
      next: (data) => {
        this.employees = data;
        this.isSearching = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.employees = [];
        this.isSearching = false;
        alert('Search failed. Check backend or network.');
        this.cd.detectChanges();
      }
    });
  }

  /** Import Excel/CSV (Admin only) */
  onImport(event: Event): void {
    if (!this.isAdmin()) {
      alert('Only admin can import.');
      return;
    }

    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.isImporting = true;
    this.employeeService.importEmployees(file).subscribe({
      next: (res: any) => {
        alert(res.message || 'Import successful');
        this.isImporting = false;
        this.loadAllEmployees();
      },
      error: (err) => {
        console.error('Import error', err);
        alert(err?.error?.message || 'Import failed. Check backend or file.');
        this.isImporting = false;
      }
    });
  }

  /** AD Sync (Admin only) */
  onAdSync(): void {
    if (!this.isAdmin()) {
      alert('Only admin can sync AD.');
      return;
    }
    alert('AD Sync will be implemented soon.');
  }

  /** Edit employee (Admin only) */
  onEdit(emp: Employee): void {
    if (!this.isAdmin()) {
      alert('Only admin can edit.');
      return;
    }
    this.router.navigate(['/employees/edit', emp.employeeId]);
  }
}
