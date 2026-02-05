import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  clickHandler?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  addBreadcrumb(breadcrumb: BreadcrumbItem): void {
    const current = this.breadcrumbsSubject.value;
    this.breadcrumbsSubject.next([...current, breadcrumb]);
  }

  clear(): void {
    this.breadcrumbsSubject.next([]);
  }

  getBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbsSubject.value;
  }
}
