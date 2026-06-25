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
import {EditEmployeeHrFormComponent} from './hr/edit-employee-hr-form';

import { ProjectsComponent } from './projects/projects';
import {ProjectCreateComponent} from './projects/project-create';
import { ProjectEditComponent } from './projects/project-edit'
import { ProjectAllocationComponent } from './project-allocation/project-allocation';
import { ProjectAllocationAddComponent } from './project-allocation/project-allocation-add'
import { ProjectAllocationEditComponent } from './project-allocation/project-allocation-edit';

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
      { path: 'user-management', component: UserManagement, canActivate: [RoleGuard] },
      { path: 'users/add', component: UserAdd, canActivate: [RoleGuard] },
      { path: 'users/edit/:id', component: UserEdit, canActivate: [RoleGuard] },
      { path: 'projects', component: ProjectsComponent, canActivate: [RoleGuard] },
      { path: 'projects/add', component: ProjectCreateComponent, canActivate: [RoleGuard] },
      { path: 'projects/edit/:projectId', component: ProjectEditComponent, canActivate: [RoleGuard] },
      { path: 'project-allocation', component: ProjectAllocationComponent, canActivate: [RoleGuard] },
      { path: 'project-allocation/add', component: ProjectAllocationAddComponent, canActivate: [RoleGuard] },
      { path: 'project-allocation/edit/:id', component: ProjectAllocationEditComponent, canActivate: [RoleGuard] },
      { path: 'hr-cm', component: HrComponent, canActivate: [RoleGuard] },
      { path: 'hr/edit/:id', component: EditEmployeeHrFormComponent, canActivate: [RoleGuard] },
      { path: 'finance-cm', component: Page, canActivate: [RoleGuard] },
      { path: 'user-management', component: Page, canActivate: [RoleGuard] },
      { path: 'reports', component: Page, canActivate: [RoleGuard] },
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: 'login' }
];
