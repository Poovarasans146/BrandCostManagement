import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}
    scrollToAbout(): void {
    const element = document.getElementById('aboutSection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
  
}
