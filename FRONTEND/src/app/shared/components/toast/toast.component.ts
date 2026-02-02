import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  private toastService = inject(ToastService);
  
  toasts$ = this.toastService.toasts$;

  removeToast(id: string) {
    this.toastService.remove(id);
  }
}