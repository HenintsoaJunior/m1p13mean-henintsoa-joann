import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
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