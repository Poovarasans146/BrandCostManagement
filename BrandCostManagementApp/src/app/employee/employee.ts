import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private employeeService: EmployeeService, private router: Router) {
    this.searchForm = new FormGroup({
      employeeId: new FormControl('') // only for input
    });
  }

  ngOnInit(): void {
    // Load all employees initially
    this.loadAllEmployees();
  }

  isAdmin(): boolean {
    return true; // For testing; replace with real auth check
  }

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
      },
      error: () => {
        this.employees = [];
        this.isSearching = false;
        alert('Search failed. Check backend or network.');
      }
    });
  }

  onImport(event: Event): void {
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
      error: () => {
        alert('Import failed. Check backend or network.');
        this.isImporting = false;
      }
    });
  }

  onAdSync(): void {
    alert('AD Sync will be implemented soon.');
  }

  onEdit(emp: Employee): void {
    this.router.navigate(['/employees/edit', emp.employeeId]);
  }
}
