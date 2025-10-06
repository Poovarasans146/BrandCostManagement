import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Employee {
  employeeId: number;
  name: string;
  mobileNumber: string;
  emailId: string;
  gender: string;
  location: string;
  address: string;
  managerName: string;
  roleStatus: string;
  cost: number;
  doj: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = 'http://localhost:5157/api/employees';

  constructor(private http: HttpClient) {}

  searchEmployee(code: string): Observable<Employee[]> {
    if (!code) code = '';
    return this.http.get<Employee[]>(`${this.baseUrl}/search/${code}`);
  }

  importEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/import`, formData);
  }
  // service/employee.service.ts
getEmployee(id: number) {
  return this.http.get<Employee>(`http://localhost:5157/api/employees/${id}`);
}

updateEmployee(id: number, data: any) {
  return this.http.put(`http://localhost:5157/api/employees/${id}`, data);
}
}
