import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutique-dashboard.component.html',
  styleUrls: ['./boutique-dashboard.component.scss'],
})
export class BoutiqueDashboardComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
