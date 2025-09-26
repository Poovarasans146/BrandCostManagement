import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { AuthService, MeResponse } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, NgClass],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout implements OnInit {
  menuItems: { label: string; path: string }[] = [];
  isNavbarCollapsed = true;
  currentYear: number = new Date().getFullYear();

  private readonly MenuConfig: { [key: string]: { label: string; path: string } } = {
    home: { label: 'Home', path: '/home' },
    dashboard: { label: 'Dashboard', path: '/dashboard' },
    employees: { label: 'Employees', path: '/employees' },
    projects: { label: 'Projects', path: '/projects' },
    'project-allocation': { label: 'Project Allocation', path: '/project-allocation' },
    'hr-cm': { label: 'HR CM', path: '/hr-cm' },
    'finance-cm': { label: 'Finance CM', path: '/finance-cm' },
    'user-management': { label: 'User Management', path: '/user-management' },
    reports: { label: 'Reports', path: '/reports' }
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.authService.getMe().subscribe({
      next: (res: MeResponse) => {
        const role = res.role || 'viewer';
        import('../config/role-permissions').then(({ RolePermissions }) => {
          const allowedKeys = RolePermissions[role] || [];
          // ✅ Update menu inside Angular zone and mark for check
          this.ngZone.run(() => {
            this.menuItems = allowedKeys
              .map(key => this.MenuConfig[key])
              .filter(Boolean);
            this.cd.detectChanges(); // ensure view updates immediately
          });
        });
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  closeNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
