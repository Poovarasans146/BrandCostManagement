import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interfaces exported
export interface Employee {
  employeeId: number;
  name: string;
  mobileNumber?: string;
  emailId?: string;
  location?: string;
  address?: string;
  managerName?: string;
  roleStatus?: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  brand: string;
  buName: string;
  brandLogo?: string;
  projectStartDate?: string;  // optional, string (ISO format)
  projectEndDate?: string;
}

export interface ProjectAllocation {
  projectAllocationId?: number;
  projectId: string;
  projectName?: string;
  employeeId: number;
  employeeName?: string;
  role?: 'On Role' | 'Off Role';
  allocation: number;
  allocationStart?: string;
  allocationEnd?: string;
  employee: Employee;
  project: Project;
}

@Injectable({ providedIn: 'root' })
export class ProjectAllocationService {
  private baseUrl = 'http://localhost:5157/api/projectallocation';

  constructor(private http: HttpClient) {}

  getAllAllocations(): Observable<ProjectAllocation[]> {
    return this.http.get<ProjectAllocation[]>(`${this.baseUrl}`, { withCredentials: true });
  }

  getByProject(projectId: string): Observable<ProjectAllocation[]> {
    return this.http.get<ProjectAllocation[]>(`${this.baseUrl}/allocations/by-project/${projectId}`, { withCredentials: true });
  }

  getByAllocation(allocationId: number): Observable<ProjectAllocation> {
    return this.http.get<ProjectAllocation>(`${this.baseUrl}/allocations/${allocationId}`, { withCredentials: true });
  }


  create(payload: Partial<ProjectAllocation>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, payload, { withCredentials: true });
  }

  update(id: number, payload: Partial<ProjectAllocation>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, { withCredentials: true });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`, { withCredentials: true });
  }

  getProjectsByBU(buName: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/by-bu/${buName}`, { withCredentials: true });
  }

  getBrandsByBU(buName: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/brands/by-bu/${buName}`, { withCredentials: true });
  }
}
