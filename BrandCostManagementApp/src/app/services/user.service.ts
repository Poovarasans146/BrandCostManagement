import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

// Interface aligned with your .NET `User` model
export interface User {
  userId: number;
  userName: string;
  fullName: string;
  password?: string;
  role: 'admin' | 'manager' | 'finance' | 'hr' | 'viewer';
  selected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5157/api/users'; // backend base URL

  constructor(private http: HttpClient) {}

  // Get all users (include cookies)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { withCredentials: true });
  }

  // Get user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Create new user
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { withCredentials: true });
  }

  // Update existing user
  updateUser(user: User): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${user.userId}`, user, { withCredentials: true });
  }

  // Delete a single user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Delete multiple users in parallel (returns an observable that resolves when all deletes finish)
  deleteUsers(ids: number[]): Observable<void[]> {
    const requests = ids.map(id => this.deleteUser(id));
    // forkJoin emits array of results when all observables complete
    return forkJoin(requests);
  }
}
