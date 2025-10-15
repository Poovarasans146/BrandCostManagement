// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private baseUrl = 'http://localhost:5157/api/Projects'; // backend API
  public lastProjectsCache: Project[] | null = null; // cache for last loaded projects
  public lastBU: string | null = null; // to track which BU is cached

  constructor(private http: HttpClient) { }

  /**
   * Get projects by Business Unit (BU)
   * Caches results so later calls (e.g., edit) can reuse without backend call.
   */
  getByBU(bu: string): Observable<Project[]> {
    // If cached and same BU → return from cache instantly
    if (this.lastProjectsCache && this.lastBU === bu) {
      return new Observable<Project[]>(observer => {
        observer.next(this.lastProjectsCache!);
        observer.complete();
      });
    }

    // Else fetch from backend
    return this.http
      .get<Project[]>(`${this.baseUrl}/by-bu/${bu}`, { withCredentials: true })
      .pipe(
        tap(list => {
          this.lastProjectsCache = list;
          this.lastBU = bu;
        })
      );
  }

  /**
   * Get project details by ID
   */
  getById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${projectId}`, {
      withCredentials: true,
    });
  }

  /**
   * Get next Project ID sequence for a given BU
   */
  nextProjectId(bu: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/next-projectid/${bu}`, {
      withCredentials: true,
    });
  }

  /**
   * Create a new Project
   */
  create(fd: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}`, fd, { withCredentials: true });
  }

  /**
   * Update existing Project
   */
  update(projectId: string, fd: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${projectId}`, fd, {
      withCredentials: true,
    });
  }

  /**
   * Recalculate allocated count for a project
   */
  recalcAllocated(projectId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${projectId}/recalc-allocated`,
      null,
      { withCredentials: true }
    );
  }

  /**
   * Clear cache manually (optional use)
   */
  clearCache(): void {
    this.lastProjectsCache = null;
    this.lastBU = null;
  }
}