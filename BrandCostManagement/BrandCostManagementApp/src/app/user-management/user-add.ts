import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { AuthService, MeResponse } from '../services/auth.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  templateUrl: './user-add.html',
  imports: [CommonModule, FormsModule],
})
export class UserAdd implements OnInit {
  newUser: Partial<User> = {};
  isAdmin = false;
  errorMsg = '';
  isSubmitting = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone  // ✅ Use NgZone to ensure routing works
  ) {}

  ngOnInit(): void {
    // Verify role
    this.authService.getMe().subscribe({
      next: (me: MeResponse) => {
        if (me && me.role === 'admin') {
          this.isAdmin = true;
        } else {
          this.errorMsg = 'Only admins can add new users.';
        }
      },
      error: () => {
        this.errorMsg = 'Failed to verify user role.';
      },
    });
  }

  saveUser(): void {
    if (!this.isAdmin) {
      alert('Only admins can add users.');
      return;
    }

    if (
      !this.newUser.userName ||
      !this.newUser.password ||
      !this.newUser.fullName ||
      !this.newUser.role
    ) {
      alert('All fields are required.');
      return;
    }

    this.isSubmitting = true;

    this.userService.addUser(this.newUser as User).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        // ✅ Use NgZone to navigate after alert
        alert('✅ User added successfully!');
        this.ngZone.run(() => this.router.navigate(['/user-management']));
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to add user:', err);
        alert('❌ Failed to add user: ' + (err?.error?.message || 'Unknown error'));
      },
    });
  }

  goBack(): void {
    // ✅ Ensure navigation works even on cancel
    this.ngZone.run(() => this.router.navigate(['/user-management']));

  }
}
