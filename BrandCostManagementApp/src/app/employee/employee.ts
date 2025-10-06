import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee.html',
})
export default class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  searchForm: FormGroup;
  isSearching = false;
  isImporting = false;
  showTable = true;

  constructor(private employeeService: EmployeeService) {
    this.searchForm = new FormGroup({
      employeeId: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadAllEmployees();
  }

  isAdmin(): boolean {
    // Replace with your logic to check admin
    return true; // for testing, admin can see import & AD Sync buttons
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
    const code = this.searchForm.get('employeeId')?.value || '';
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
    alert(`Edit employee ${emp.employeeId} - implement your logic`);
  }
}
