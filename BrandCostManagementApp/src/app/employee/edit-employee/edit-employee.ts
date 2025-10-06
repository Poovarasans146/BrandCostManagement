import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';
import { FormsModule } from '@angular/forms'; // optional

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-employee.html',
})
export class EditEmployeeComponent implements OnInit {
  editForm!: FormGroup;
  employeeId!: number;
  employeeData!: Employee;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    this.editForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      gender: [''],
      location: [''],
      address: [''],
      managerName: [''],
      roleStatus: [''],
      doj: [''],
    });

    this.empService.getEmployee(this.employeeId).subscribe({
      next: (res: Employee) => {
        this.employeeData = res;
        this.editForm.patchValue(this.employeeData);
      },
      error: (err: any) => {
        alert('Failed to load employee data.');
      },
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSubmitting = true;

    const payload = { ...this.editForm.getRawValue() };

    this.empService.updateEmployee(this.employeeId, payload).subscribe({
      next: (res: any) => {
        alert('Employee updated successfully.');
        this.router.navigate(['/employees']);
      },
      error: (err: any) => {
        alert('Failed to update employee.');
        this.isSubmitting = false;
      },
    });
  }
}
