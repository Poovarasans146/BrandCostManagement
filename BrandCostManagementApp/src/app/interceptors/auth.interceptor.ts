import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Send cookies for same-origin / cross-origin calls
    const clonedReq = req.clone({ withCredentials: true });

    return next.handle(clonedReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Only redirect to login for 401/403 on protected APIs
        const url = req.url.toLowerCase();

        // Exclude OTP verification and login APIs from automatic redirect
        if ((err.status === 401 || err.status === 403) &&
            !url.includes('/verify-otp') &&
            !url.includes('/login')) {
          // Optional: clear any client state here before navigation
          this.router.navigate(['/login']);
        }

        // Always propagate the error so the component can handle it
        return throwError(() => err);
      })
    );
  }
}
