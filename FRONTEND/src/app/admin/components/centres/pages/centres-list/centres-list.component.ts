import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CentresService } from '../../services/centres.service';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './centres-list.component.html',
  styleUrls: ['./centres-list.component.scss']
})
export class CentresListComponent implements OnInit {
  isLoading = false;
  centresCount = 0;
  batimentsCount = 0;
  etagesCount = 0;
  emplacementsCount = 0;

  private loadingCount = 0;

  constructor(private centresService: CentresService) {}

  ngOnInit() {
    this.loadCounts();
  }

  private onRequestDone(): void {
    this.loadingCount--;
    if (this.loadingCount === 0) {
      this.isLoading = false;
    }
  }

  loadCounts() {
    this.isLoading = true;
    this.loadingCount = 4;

    this.centresService.getAllCentres().subscribe({
      next: (centres) => { this.centresCount = centres.length; this.onRequestDone(); },
      error: () => { this.onRequestDone(); }
    });

    this.centresService.getBatiments().subscribe({
      next: (batiments) => { this.batimentsCount = batiments.length; this.onRequestDone(); },
      error: () => { this.onRequestDone(); }
    });

    this.centresService.getEtages().subscribe({
      next: (etages) => { this.etagesCount = etages.length; this.onRequestDone(); },
      error: () => { this.onRequestDone(); }
    });

    this.centresService.getEmplacements().subscribe({
      next: (emplacements) => { this.emplacementsCount = emplacements.length; this.onRequestDone(); },
      error: () => { this.onRequestDone(); }
    });
  }
}
