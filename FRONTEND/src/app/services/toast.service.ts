import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  showSuccess(message: string, duration: number = 5000) {
    this.show({
      message,
      type: 'success',
      duration,
    });
  }

  showError(message: string, duration: number = 7000) {
    this.show({
      message,
      type: 'error',
      duration,
    });
  }

  showWarning(message: string, duration: number = 6000) {
    this.show({
      message,
      type: 'warning',
      duration,
    });
  }

  showInfo(message: string, duration: number = 5000) {
    this.show({
      message,
      type: 'info',
      duration,
    });
  }

  private show(toast: Omit<Toast, 'id'>) {
    const id = this.generateId();
    const newToast: Toast = { ...toast, id };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    if (toast.duration) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration);
    }
  }

  remove(id: string) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id));
  }

  clear() {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
