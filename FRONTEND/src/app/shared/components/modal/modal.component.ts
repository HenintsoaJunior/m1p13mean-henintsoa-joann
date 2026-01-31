import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header" *ngIf="title">
          <h3>{{ title }}</h3>
          <button class="modal-close" (click)="close()" *ngIf="showCloseButton">✕</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="hasFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() hasFooter = false;
  @Input() showCloseButton = true;
  @Input() closeOnOverlayClick = true;
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }

  onOverlayClick() {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }
}