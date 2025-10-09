import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  templateUrl: './user-edit.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class UserEdit implements OnInit {
  editForm!: FormGroup;
  userId!: number;
  isSubmitting = false;
  private currentPassword: string = '';
  private currentUsername: string = '';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      alert('User ID missing in route');
      this.ngZone.run(() => this.router.navigate(['/user-management']));
      return;
    }
    this.userId = Number(idParam);

    this.editForm = this.fb.group({
      userId: [{ value: '', disabled: true }],
      userName: [{ value: '', disabled: true }],
      fullName: ['', Validators.required],
      role: ['', Validators.required],
    });

    // Load user data
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        console.log(user);
        this.currentPassword = user.password || '';
        this.currentUsername = user.userName || '';
        this.editForm.patchValue({
          userId: user.userId,
          userName: user.userName,
          fullName: user.fullName,
          role: user.role,
          
        });
      },
      error: (err) => {
        console.error('Failed to load user', err);
        alert(err?.error?.message || 'Failed to load user data');
        this.ngZone.run(() => this.router.navigate(['/user-management']));
      },
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSubmitting = true;

    // Get form values including disabled fields
    const formData = this.editForm.getRawValue();

    // Send only editable fields to backend
    const payload: Partial<User> = {
      userName: this.currentUsername,
      fullName: formData.fullName,
      role: formData.role,
      password: this.currentPassword
    };
     console.log(payload);
    this.userService.updateUser({ userId: this.userId, ...payload } as User).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('✅ User updated successfully!');
        this.ngZone.run(() => this.router.navigate(['/user-management']));
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert(err?.error?.message || 'Failed to update users.');
      },
    });
  }

  goBack() {
    this.ngZone.run(() => this.router.navigate(['/user-management']));
  }
}
