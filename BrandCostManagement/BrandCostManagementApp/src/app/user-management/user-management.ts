import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.html',
  imports: [CommonModule, FormsModule],
})
export class UserManagement implements OnInit {
  allUsers: User[] = []; // Full backend data
  users: User[] = [];    // Filtered/displayed data
  searchTerm: string = '';
  loading = true;

  constructor(private userService: UserService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.users = [...this.allUsers];
        this.loading = false;
        this.cdr.detectChanges(); // Force Angular to update view
        console.log('Users loaded:', this.users);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.loading = false;
      },
    });
  }

  search(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.users = !term
      ? [...this.allUsers]
      : this.allUsers.filter(
          (u) =>
            u.userName.toLowerCase().includes(term) ||
            u.fullName.toLowerCase().includes(term)
        );
  }

  addUser(): void {
    this.router.navigate(['/users/add']);
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  deleteSelected(): void {
    const ids = this.users.filter((u) => u.selected).map((u) => u.userId);
    if (ids.length === 0) return alert('Select at least one user to delete');

    this.userService.deleteUsers(ids).subscribe({
      next: () => this.ngOnInit(), // Reload after delete
      error: () => alert('Failed to delete users'),
    });
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.users.forEach((u) => (u.selected = checked));
  }
}
