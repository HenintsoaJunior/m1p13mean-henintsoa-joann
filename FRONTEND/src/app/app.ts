import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App {
  title = 'Template Angular - Multi Profils';
}
