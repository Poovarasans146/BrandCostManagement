import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class EditEmployeeComponent implements OnInit {
  editForm!: FormGroup;
  employeeId!: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empService: EmployeeService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      alert('Employee ID missing in route');
      this.router.navigate(['/employees']);
      return;
    }
    this.employeeId = Number(idParam);

    this.editForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      mobileNumber: [''],
      emailId: ['', [Validators.required, Validators.email]],
      gender: [''],
      location: [''],
      address: [''],
      managerName: [''],
      roleStatus: [''],
      cost: [''],
      doj: ['']
    });

    // Load employee data
    this.empService.getEmployee(this.employeeId).subscribe({
      next: (emp: Employee) => {
        this.editForm.patchValue({
          employeeId: emp.employeeId,
          name: emp.name,
          mobileNumber: emp.mobileNumber,
          emailId: emp.emailId,
          gender: emp.gender,
          location: emp.location,
          address: emp.address,
          managerName: emp.managerName,
          roleStatus: emp.roleStatus,
          cost: emp.cost,
          doj: emp.doj ? new Date(emp.doj).toISOString().substring(0, 10) : ''
        });
      },
      error: (err: any) => {
        console.error('Failed to load employee', err);
        alert(err?.error?.message || 'Failed to load employee data');
        this.router.navigate(['/employees']);
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSubmitting = true;

    // Get all form values including disabled fields
    const formData = this.editForm.getRawValue();

    // Remove fields backend shouldn't update
    delete formData.employeeId;
    delete formData.emailId;

    // Format date properly
    if (formData.doj) {
      formData.doj = new Date(formData.doj).toISOString().substring(0, 10);
    }

    // Replace empty strings with null to avoid backend parsing issues
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') formData[key] = null;
    });

    console.log('Payload to backend:', formData); // debug payload

    // Send payload as proper JSON object
    this.empService.updateEmployee(this.employeeId, formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        alert(res.message || 'Employee updated successfully!');
        this.router.navigate(['/employees']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error(err);
        alert(err.error?.message || 'Failed to update employee.');
      }
    });
  }
}
