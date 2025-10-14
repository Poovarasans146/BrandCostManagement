import { Component, OnInit, NgZone } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, MeResponse } from '../services/auth.service';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hr.html',
})
export default class HrComponent implements OnInit {
  employees: Employee[] = [];
  searchForm: FormGroup;
  userRole: string = 'viewer';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.searchForm = new FormGroup({
      searchKey: new FormControl(''),
    });
  }

  ngOnInit(): void {
    // Load role from localStorage first
    this.userRole = localStorage.getItem('userRole') || 'viewer';

    // Validate role from backend
    this.authService.getMe().subscribe({
      next: (res: MeResponse) => {
        const verifiedRole = res?.role || this.userRole;
        localStorage.setItem('userRole', verifiedRole);
        this.ngZone.run(() => (this.userRole = verifiedRole));
      },
      error: () => {
        this.ngZone.run(() => {
          this.userRole = localStorage.getItem('userRole') || 'viewer';
        });
      }
    });
  }

  /** Check access (only HR or Admin) */
  canAccess(): boolean {
    const role = this.userRole.toLowerCase();
    return role === 'admin' || role === 'hr';
  }

  /** Search by ID or Name */
  onSearch(): void {
    const key = this.searchForm.get('searchKey')?.value?.trim();
    if (!key) {
      alert('Please enter Employee ID or Name to search.');
      return;
    }

    if (!this.canAccess()) {
      alert('You do not have permission to view this page.');
      return;
    }

    this.employeeService.searchEmployee(key).subscribe({
      next: (data) => (this.employees = data),
      error: () => {
        this.employees = [];
        alert('Search failed. Check backend or network.');
      },
    });
  }

  /** Edit employee - HR only */
  onEdit(emp: Employee): void {
    if (!this.canAccess()) {
      alert('You do not have permission to edit.');
      return;
    }

    this.router.navigate(['/hr/edit', emp.employeeId]);
  }
}
