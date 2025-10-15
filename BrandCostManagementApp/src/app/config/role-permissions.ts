export const RolePermissions: { [key: string]: string[] } = {
  admin: [
    'home',
    'dashboard',
    'employees',
    'projects',
    'project-allocation',
    'hr-cm',
    'finance-cm',
    'user-management',
    'reports',
    'employees/edit/:id',
    'users/add',
    'users/edit/:id',
    'hr/edit/:id',
    'projects/edit/:projectId',
    'projects/add'
  ],
  manager: ['home', 'dashboard', 'employees', 'projects', 'project-allocation','reports', 'projects/edit/:projectId'],
  hr: ['home', 'dashboard', 'employees', 'hr-cm'],
  finance: ['home', 'dashboard', 'employees', 'finance-cm'],
  viewer: ['home', 'dashboard', 'employees']
};
