import {Component, OnInit, HostListener} from '@angular/core';

import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';

import {ActivatedRoute, Router, RouterModule} from '@angular/router';

import {EmployeeService, Employee} from '../../services/employee.service';

import { CommonModule } from '@angular/common';

import {CanComponentDeactivate} from '../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})

export class EditEmployeeComponent implements OnInit, CanComponentDeactivate {

  editForm!: FormGroup;
  employeeId!: number;
  isSubmitting = false;
  isSaved = false;
  allowNavigation = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empService: EmployeeService
  ) {}

  @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(event: BeforeUnloadEvent): void {

      if (
        this.editForm &&
        this.editForm.dirty &&
        !this.isSaved
      ) {

        event.preventDefault();

        event.returnValue = '';

      }

    }

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

  canDeactivate(): boolean {

    if (this.allowNavigation) {
      return true;
    }

    if (
      this.editForm &&
      this.editForm.dirty &&
      !this.isSaved
    ) {

      return confirm(
        'You have unsaved changes.\n\nDo you want to leave this page?'
      );

    }

    return true;

  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  onSubmit(): void {

    if (this.editForm.invalid) {
      return;
    }

    if (!this.editForm.dirty) {
      return;
    }

    this.isSubmitting = true;

    const formData = this.editForm.getRawValue();

    delete formData.employeeId;
    delete formData.emailId;

    if (formData.doj) {
      formData.doj = new Date(formData.doj)
        .toISOString()
        .substring(0, 10);
    }

    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    console.log('Payload to backend:', formData);

    this.empService.updateEmployee(this.employeeId, formData).subscribe({

      next: (res: any) => {

        this.isSubmitting = false;

        this.isSaved = true;

        this.allowNavigation = true;

        this.editForm.markAsPristine();

        alert(res.message || 'Employee updated successfully!');

        this.router.navigate(['/employees']);

      },

      error: (err: any) => {

        this.isSubmitting = false;

        this.isSaved = false;

        this.allowNavigation = false;

        console.error(err);

        alert(err?.error?.message || 'Failed to update employee.');

      }

    });

  }

  hasChanges(): boolean {

    return this.editForm?.dirty ?? false;

  }

}
