import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // Search only if code is provided
  searchEmployee(code: string): Observable<Employee[]> {
    if (!code || code.trim() === '') {
      return new Observable<Employee[]>(observer => {
        observer.next([]); // return empty array if no code
        observer.complete();
      });
    }
    return this.http.get<Employee[]>(`${this.baseUrl}/search/${code}`);
  }

  importEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/import`, formData);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  updateEmployee(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}`,
      payload,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true }
    );
  }

  // Optional: get all employees (used initially)
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}`);
  }
}
