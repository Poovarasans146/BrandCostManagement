import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from '../services/employee.service';

@Component({
  selector: 'app-edit-employee-hr-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-employee-hr-form.html'
})
export class EditEmployeeHrFormComponent implements OnInit {
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
      this.router.navigate(['/hr-cm']);
      return;
    }

    this.employeeId = Number(idParam);

    this.editForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: true }],
      mobileNumber: [{ value: '', disabled: true }],
      emailId: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],
      location: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      managerName: [{ value: '', disabled: true }],
      roleStatus: [{ value: '', disabled: true }],
      doj: [{ value: '', disabled: true }],
      cost: ['', [Validators.required, Validators.min(0)]]
    });

    // Load employee data
    this.empService.getEmployee(this.employeeId).subscribe({
      next: (emp: Employee) => {
        // Make sure date matches input format (YYYY-MM-DD)
        const dojStr = emp.doj ? new Date(emp.doj).toISOString().substring(0, 10) : '';

        // Patch all fields (disabled ones will be updated visually)
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
          doj: dojStr,
          cost: emp.cost ?? ''
        });
      },
      error: (err: any) => {
        console.error('Failed to load employee', err);
        alert(err?.error?.message || 'Failed to load employee data');
        this.router.navigate(['/hr-cm']);
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.get('cost')?.invalid) {
      this.editForm.get('cost')?.markAsTouched();
      alert('Please provide a valid cost (>= 0).');
      return;
    }

    this.isSubmitting = true;

    const costValue = Number(this.editForm.get('cost')?.value);

    // Payload: use employeeController update (only cost update payload)
    const payload = {
      employeeId: this.employeeId,
      cost: costValue
    };

    this.empService.updateEmployee(this.employeeId, payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        alert(res?.message || 'Cost updated successfully!');
        this.router.navigate(['/hr-cm']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Failed to update cost', err);
        alert(err?.error?.message || 'Failed to update cost.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/hr-cm']);
  }
}
