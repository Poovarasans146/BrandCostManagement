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
    'hr/edit/:id'
  ],
  manager: ['home', 'dashboard', 'employees', 'projects', 'project-allocation','reports'],
  hr: ['home', 'dashboard', 'employees', 'hr-cm'],
  finance: ['home', 'dashboard', 'employees', 'finance-cm'],
  viewer: ['home', 'dashboard', 'employees']
};
