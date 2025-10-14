import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // ✅ Only protect routes under Layout (after login + OTP)
    // If the current route is login or otp, allow access without authentication
    const allowedWithoutAuth = ['/login', '/otp'];
    if (allowedWithoutAuth.includes(state.url)) {
      return of(true);
    }

    return this.authService.getMe().pipe(
      map(res => {
        // ✅ User is fully authenticated if userId exists
        if (res && res.userId) {
          return true;
        }
        // ❌ Not authenticated → redirect to login
        return this.router.createUrlTree(['/login']);
      }),
      catchError(() => {
        // ❌ On error (like 401), also redirect to login
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
