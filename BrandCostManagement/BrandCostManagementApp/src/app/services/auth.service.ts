import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MeResponse {
  userId: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5157/api/auth';

  constructor(private http: HttpClient) {}

  // OTP verification
  verifyOtp(otpRequestId: number, otp: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verify-otp`,
      { otpRequestId, otp },
      { withCredentials: true }
    );
  }

  // ✅ Get user info securely from backend (recommended)
  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      catchError(() => of({ userId: '', role: 'viewer' }))
    );
  }

  // Logout clears cookie on backend
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  // Check only auth validity (optional)
  checkAuth(): Observable<{ valid: boolean }> {
    return this.http.get<{ valid: boolean }>(
      `${this.apiUrl}/check`,
      { withCredentials: true }
    );
  }
}
