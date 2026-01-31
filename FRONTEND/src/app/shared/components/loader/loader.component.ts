import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" *ngIf="isLoading">
      <div class="loader-content">
        <div class="loader-spinner">{{ loadingText }}</div>
        <p class="loader-message" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() loadingText = 'Chargement...';
  @Input() message?: string;
}