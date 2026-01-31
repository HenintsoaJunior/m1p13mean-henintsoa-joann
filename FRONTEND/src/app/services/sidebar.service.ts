import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  public collapsed$ = this.collapsedSubject.asObservable();

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  toggleSidebar(): void {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  setSidebarState(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
  }
}
