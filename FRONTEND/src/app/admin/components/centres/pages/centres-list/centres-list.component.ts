import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CentresService } from '../../services/centres.service';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="sections-grid">
        <!-- Section Centres -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon centres">
              <i class="fas fa-store"></i>
            </div>
            <div class="section-info">
              <h3>Centres Commerciaux</h3>
              <p>Gérer les centres commerciaux principaux</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/centres-crud" class="btn btn-primary">
              <i class="fas fa-cog"></i>
              Gérer les centres
            </a>
          </div>
          <div class="section-stats">
            <div class="stat">
              <span class="stat-value">{{ centresCount }}</span>
              <span class="stat-label">Centres</span>
            </div>
          </div>
        </div>

        <!-- Section Bâtiments -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon batiments">
              <i class="fas fa-building"></i>
            </div>
            <div class="section-info">
              <h3>Bâtiments</h3>
              <p>Gérer les bâtiments des centres</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/batiments-crud" class="btn btn-success">
              <i class="fas fa-cog"></i>
              Gérer les bâtiments
            </a>
          </div>
          <div class="section-stats">
            <div class="stat">
              <span class="stat-value">{{ batimentsCount }}</span>
              <span class="stat-label">Bâtiments</span>
            </div>
          </div>
        </div>

        <!-- Section Étages -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon etages">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="section-info">
              <h3>Étages</h3>
              <p>Gérer les étages des bâtiments</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/etages-crud" class="btn btn-warning">
              <i class="fas fa-cog"></i>
              Gérer les étages
            </a>
          </div>
          <div class="section-stats">
            <div class="stat">
              <span class="stat-value">{{ etagesCount }}</span>
              <span class="stat-label">Étages</span>
            </div>
          </div>
        </div>

        <!-- Section Emplacements -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon emplacements">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="section-info">
              <h3>Emplacements</h3>
              <p>Gérer les emplacements commerciaux</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/emplacements-crud" class="btn btn-danger">
              <i class="fas fa-cog"></i>
              Gérer les emplacements
            </a>
          </div>
          <div class="section-stats">
            <div class="stat">
              <span class="stat-value">{{ emplacementsCount }}</span>
              <span class="stat-label">Emplacements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-icon i {
      color: white;
      font-size: 32px;
    }
    
    .btn i {
      color: white;
      font-size: 14px;
      margin-right: 8px;
    }
  `]
})
export class CentresListComponent implements OnInit {
  centresCount = 0;
  batimentsCount = 0;
  etagesCount = 0;
  emplacementsCount = 0;

  constructor(private centresService: CentresService) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.centresService.getCentres().subscribe(centres => {
      this.centresCount = centres.length;
    });

    this.centresService.getBatiments().subscribe(batiments => {
      this.batimentsCount = batiments.length;
    });

    this.centresService.getEtages().subscribe(etages => {
      this.etagesCount = etages.length;
    });

    this.centresService.getEmplacements().subscribe(emplacements => {
      this.emplacementsCount = emplacements.length;
    });
  }
}
