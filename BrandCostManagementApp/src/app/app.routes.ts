import { Routes } from '@angular/router';
import { Login } from './login/login';
import { OtpComponent } from './otp/otp';
import { Layout } from './layout/layout';
import { Home } from './home/home';
import { Page } from './page/page';
import EmployeeComponent from "./employee/employee";
import { EditEmployeeComponent } from './employee/edit-employee/edit-employee';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'otp', component: OtpComponent }, // OTP does not require AuthGuard

  // Protected Layout and children
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home, canActivate: [RoleGuard] },
      { path: 'dashboard', component: Page, canActivate: [RoleGuard] },
      { path: 'employees', component: EmployeeComponent, canActivate: [RoleGuard] },
      { path: 'employees/edit/:id', component: EditEmployeeComponent, canActivate: [RoleGuard] },
      { path: 'projects', component: Page, canActivate: [RoleGuard] },
      { path: 'project-allocation', component: Page, canActivate: [RoleGuard] },
      { path: 'hr-cm', component: Page, canActivate: [RoleGuard] },
      { path: 'finance-cm', component: Page, canActivate: [RoleGuard] },
      { path: 'user-management', component: Page, canActivate: [RoleGuard] },
      { path: 'reports', component: Page, canActivate: [RoleGuard] },
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: 'login' }
];
