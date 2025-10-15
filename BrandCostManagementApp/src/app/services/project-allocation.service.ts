// src/app/services/project-allocation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectAllocationService {
  private baseUrl = 'http://localhost:5157/api/ProjectAllocations'; // adjust if controller is different

  constructor(private http: HttpClient) { }

  getByProject(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-project/${projectId}`, { withCredentials: true });
  }

  create(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload, { withCredentials: true });
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload, { withCredentials: true });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}