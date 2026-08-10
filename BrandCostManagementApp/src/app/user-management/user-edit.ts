import { Component, OnInit, NgZone, HostListener  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';
import { CanComponentDeactivate } from '../guards/unsaved-changes.guard';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  templateUrl: './user-edit.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class UserEdit implements OnInit, CanComponentDeactivate {
  editForm!: FormGroup;
  userId!: number;
  isSubmitting = false;
  private currentPassword: string = '';
  private currentUsername: string = '';
  isSaved = false;
  allowNavigation = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private ngZone: NgZone
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {

      if (!this.allowNavigation && this.editForm.dirty) {

          event.preventDefault();

          event.returnValue = '';

      }

  }

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
        this.editForm.markAsPristine();
      },
      error: (err) => {
        console.error('Failed to load user', err);
        alert(err?.error?.message || 'Failed to load user data');
        this.ngZone.run(() => this.router.navigate(['/user-management']));
      },
    });
  }

  canDeactivate(): boolean {

      if (
          this.allowNavigation ||
          this.isSaved ||
          !this.editForm.dirty
      ) {
          return true;
      }

      return confirm(
          'You have unsaved changes.\n\nDo you want to leave this page without saving?'
      );

  }

  hasChanges(): boolean {
    return this.editForm?.dirty && !this.isSaved;
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

          this.isSaved = true;

         // this.allowNavigation = true;

          this.editForm.markAsPristine();

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

     // this.allowNavigation = true;

      this.ngZone.run(() => {
          this.router.navigate(['/user-management']);
      });

  }
}
