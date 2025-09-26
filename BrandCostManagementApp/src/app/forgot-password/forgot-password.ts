import { Component, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  step: 'username' | 'otp' | 'reset' = 'username';

  username: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  otpRequestId: number = 0;
  userId: number = 0; // store userId after OTP verification

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  /** Step 1: Submit username/email */
  onSubmitUsername() {
    if (!this.username) {
      alert('Please enter username/email');
      return;
    }

    this.http.post<any>('http://localhost:5157/api/Users/forgot-password',
      { username: this.username },
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.otpRequestId = res.otpRequestId;
        alert('✅ OTP sent to your email.');
        this.step = 'otp';
      },
      error: err => {
        alert(err.error?.message || '❌ User not found');
      }
    });
  }

  /** Step 2: Submit OTP */
  onSubmitOtp() {
    if (!this.otp) {
      alert('Please enter OTP');
      return;
    }

    this.http.post<any>('http://localhost:5157/api/Users/verify-forgot-otp',
      { otpRequestId: this.otpRequestId, otp: this.otp },
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.userId = res.userId; // save userId for reset
        alert('✅ OTP verified. Please set a new password.');
        this.step = 'reset';
      },
      error: err => {
        alert(err.error?.message || '❌ Invalid OTP');
      }
    });
  }

  /** Step 3: Reset password */
  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Please enter both password fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    this.http.post<any>('http://localhost:5157/api/Users/reset-password',
      { userId: this.userId, newPassword: this.newPassword, confirmPassword: this.confirmPassword },
      { withCredentials: true }
    ).subscribe({
      next: res => {
        alert('✅ Password updated successfully! Please login again.');
        this.ngZone.run(() => this.router.navigate(['/login']));
      },
      error: err => {
        alert(err.error?.message || '❌ Failed to update password');
      }
    });
  }
}
