import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th *ngFor="let column of columns">{{ column.label }}</th>
            <th *ngIf="hasActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; trackBy: trackByFn">
            <td *ngFor="let column of columns">
              {{ getValue(row, column.key) }}
            </td>
            <td *ngIf="hasActions">
              <ng-content select="[slot=actions]"></ng-content>
            </td>
          </tr>
          <tr *ngIf="data.length === 0">
            <td [attr.colspan]="getTotalColumns()" class="empty-message">
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() columns: Array<{ key: string; label: string }> = [];
  @Input() data: Array<any> = [];
  @Input() hasActions = false;
  @Input() emptyMessage = 'Aucune donnée disponible';

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  getTotalColumns(): number {
    return this.columns.length + (this.hasActions ? 1 : 0);
  }
}