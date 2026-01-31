import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="form" [class.form-horizontal]="layout === 'horizontal'">
      <ng-content></ng-content>
    </form>
  `,
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
}