// src/app/app.routes.ts
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
import { UserManagement } from './user-management/user-management';
import { UserAdd } from './user-management/user-add';
import { UserEdit } from './user-management/user-edit';
import HrComponent from './hr/hr';
import { EditEmployeeHrFormComponent } from './hr/edit-employee-hr-form';

import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectsEditComponent } from './pages/projects/projects-edit.component';
import { ProjectAllocationsComponent } from './pages/project-allocations/project-allocations.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'otp', component: OtpComponent },

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

      { path: 'user-management', component: UserManagement, canActivate: [RoleGuard] },
      { path: 'users/add', component: UserAdd, canActivate: [RoleGuard] },
      { path: 'users/edit/:id', component: UserEdit, canActivate: [RoleGuard] },

      // Projects and project edit page
      { path: 'projects', component: ProjectsComponent, canActivate: [RoleGuard] },
      { path: 'projects/edit/:projectId', component: ProjectsEditComponent, canActivate: [RoleGuard] },

      // Project allocations (plural)
      { path: 'project-allocations', component: ProjectAllocationsComponent, canActivate: [RoleGuard] },

      { path: 'hr-cm', component: HrComponent, canActivate: [RoleGuard] },
      { path: 'hr/edit/:id', component: EditEmployeeHrFormComponent, canActivate: [RoleGuard] },

      { path: 'finance-cm', component: Page, canActivate: [RoleGuard] },
      { path: 'reports', component: Page, canActivate: [RoleGuard] },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
