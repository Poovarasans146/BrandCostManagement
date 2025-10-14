// src/app/home/home.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, MeResponse } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Call backend to confirm session and get role, then store in localStorage
    this.authService.getMe().subscribe({
      next: (res: MeResponse) => {
        try {
          const role = res?.role || localStorage.getItem('userRole') || 'viewer';
          localStorage.setItem('userRole', role);
        } catch {
          // defensive: if anything fails, fall back to viewer
          localStorage.setItem('userRole', localStorage.getItem('userRole') || 'viewer');
        }
      },
      error: () => {
        // On error, keep any existing role or set viewer
        localStorage.setItem('userRole', localStorage.getItem('userRole') || 'viewer');
      }
    });
  }

  scrollToAbout(): void {
    const element = document.getElementById('aboutSection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
