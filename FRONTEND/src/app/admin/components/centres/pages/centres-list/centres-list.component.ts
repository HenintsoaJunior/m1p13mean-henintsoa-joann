import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M15,7H20.5L20,4H17V2H15M6.5,2V4H3.5L3,7H8.5V2M9,7H15V9H9M15,10V15H13V12H11V15H9V10M8,17V22H10V17M14,17V22H16V17M5,9H19V17H17V15H13V17H11V15H7V17H5Z"
                />
              </svg>
            </div>
            <div class="section-info">
              <h3>Centres Commerciaux</h3>
              <p>Gérer les centres commerciaux principaux</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/centres-crud" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6,2V22H18V2M8,4H16V6H8M8,8H16V10H8M8,12H16V14H8M8,16H16V18H8" />
              </svg>
            </div>
            <div class="section-info">
              <h3>Bâtiments</h3>
              <p>Gérer les bâtiments des centres</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/batiments-crud" class="btn btn-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7L17,12H15V18H9V12H7L12,7.7M11,13V16H13V13H11Z"
                />
              </svg>
            </div>
            <div class="section-info">
              <h3>Étages</h3>
              <p>Gérer les étages des bâtiments</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/etages-crud" class="btn btn-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"
                />
              </svg>
            </div>
            <div class="section-info">
              <h3>Emplacements</h3>
              <p>Gérer les emplacements commerciaux</p>
            </div>
          </div>
          <div class="section-actions">
            <a routerLink="/admin/centres/emplacements-crud" class="btn btn-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
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
})
export class CentresListComponent {
  centresCount = 0;
  batimentsCount = 0;
  etagesCount = 0;
  emplacementsCount = 0;
}
