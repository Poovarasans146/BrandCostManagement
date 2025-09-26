import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="container py-5">
    <h2 class="fw-bold mb-3">{{title}}</h2>
    <p class="text-secondary">Content coming soon.</p>
  </section>
  `,
})
export class Page {
  @Input() title = '';
}
