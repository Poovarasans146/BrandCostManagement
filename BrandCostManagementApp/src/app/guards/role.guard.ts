import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolePermissions } from '../config/role-permissions';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const path = route.routeConfig?.path || '';

    return this.authService.getMe().pipe(
      map(res => {
        const role = (res && (res as any).role) ? (res as any).role : 'viewer';
        const allowedPaths = RolePermissions[role] || [];

        if (allowedPaths.includes(path)) {
          return true;
        }
        // Not authorized -> redirect (UrlTree) to login (or a not-authorized page)
        return this.router.createUrlTree(['/login']);
      }),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
