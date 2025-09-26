import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ✅ add RouterModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], // ✅ add RouterModule here
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username: string = '';
  password: string = '';
  submitted: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.submitted = true;

    if (!this.username || !this.password) {
      alert('Please enter both username and password');
      return;
    }

    this.http.post<any>('http://localhost:5157/api/auth/login', {
      username: this.username,
      password: this.password
    }, { withCredentials: true }).subscribe({
      next: res => {
        alert(res.message || 'OTP sent to your email');
        this.router.navigate(['/otp'], { queryParams: { otpRequestId: res.otpRequestId } });
      },
      error: err => {
        alert(err.error?.message || 'Invalid username or password');
      }
    });
  }
}
