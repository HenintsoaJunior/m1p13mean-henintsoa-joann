import { Component } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CardComponent, TableComponent],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Tableau de bord Administration</h1>
        <p>Vue d'ensemble de la plateforme</p>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <app-card class="stat-card">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">Utilisateurs totaux</div>
        </app-card>

        <app-card class="stat-card">
          <div class="stat-number">{{ stats.totalBoutiques }}</div>
          <div class="stat-label">Boutiques actives</div>
        </app-card>

        <app-card class="stat-card">
          <div class="stat-number">{{ stats.totalCommandes }}</div>
          <div class="stat-label">Commandes ce mois</div>
        </app-card>

        <app-card class="stat-card">
          <div class="stat-number">{{ stats.chiffreAffaires }}€</div>
          <div class="stat-label">Chiffre d'affaires</div>
        </app-card>
      </div>

      <!-- Tableaux -->
      <div class="tables-section">
        <app-card title="Dernières activités" class="table-card">
          <app-table [columns]="activitiesColumns" [data]="activitiesData" [hasActions]="true">
            <div slot="actions" class="table-actions">
              <button class="btn-view">Voir</button>
            </div>
          </app-table>
        </app-card>

        <app-card title="Boutiques récentes" class="table-card">
          <app-table [columns]="boutiquesColumns" [data]="boutiquesData" [hasActions]="true">
            <div slot="actions" class="table-actions">
              <button class="btn-validate">Valider</button>
              <button class="btn-reject">Rejeter</button>
            </div>
          </app-table>
        </app-card>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  stats = {
    totalUsers: 1247,
    totalBoutiques: 89,
    totalCommandes: 156,
    chiffreAffaires: 28450,
  };

  activitiesColumns = [
    { key: 'date', label: 'Date' },
    { key: 'user', label: 'Utilisateur' },
    { key: 'action', label: 'Action' },
    { key: 'status', label: 'Statut' },
  ];

  activitiesData = [
    {
      id: 1,
      date: '2024-01-30',
      user: 'Jean Dupont',
      action: 'Inscription boutique',
      status: 'En attente',
    },
    {
      id: 2,
      date: '2024-01-30',
      user: 'Marie Martin',
      action: 'Commande #1234',
      status: 'Validée',
    },
    {
      id: 3,
      date: '2024-01-29',
      user: 'Pierre Durand',
      action: 'Mise à jour profil',
      status: 'Terminée',
    },
  ];

  boutiquesColumns = [
    { key: 'nom', label: 'Nom de la boutique' },
    { key: 'proprietaire', label: 'Propriétaire' },
    { key: 'dateCreation', label: 'Date de création' },
    { key: 'statut', label: 'Statut' },
  ];

  boutiquesData = [
    {
      id: 1,
      nom: 'Boutique Tech',
      proprietaire: 'Antoine Laurent',
      dateCreation: '2024-01-25',
      statut: 'En validation',
    },
    {
      id: 2,
      nom: 'Mode & Style',
      proprietaire: 'Sophie Bernard',
      dateCreation: '2024-01-24',
      statut: 'En validation',
    },
  ];
}
