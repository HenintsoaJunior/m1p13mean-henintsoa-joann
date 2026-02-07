import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input() columns: Array<{ key: string; label: string }> = [];
  @Input() data: Array<any> = [];
  @Input() hasActions = false;
  @Input() emptyMessage = 'Aucune donnée disponible';
  @Input() actionTemplate?: TemplateRef<any>;

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