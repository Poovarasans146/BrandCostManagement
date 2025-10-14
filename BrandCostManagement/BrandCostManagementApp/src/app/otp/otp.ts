import { Component, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.html',
  styleUrls: ['./otp.css']
})
export class OtpComponent {
  otp: string = '';
  submitted: boolean = false;
  errorMessage: string = '';
  otpRequestId: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.otpRequestId = Number(this.route.snapshot.queryParamMap.get('otpRequestId'));
  }

  onVerifyOtp() {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.otp) return;

    this.http.post<any>('http://localhost:5157/api/auth/verify-otp', {
      otpRequestId: this.otpRequestId,
      otp: this.otp
    }, { withCredentials: true }).subscribe({
      next: res => {
        this.ngZone.run(() => {
          alert(res.message || 'OTP verified successfully!');
          this.router.navigate(['/home']);
        });
      },
      error: err => {
        this.ngZone.run(() => {
          alert(err.error?.message || 'Invalid OTP');
          this.errorMessage = err.error?.message || 'Invalid OTP';
          // ✅ stay on OTP page, do not redirect
        });
      }
    });
  }
}
