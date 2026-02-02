import { Component } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CardComponent, TableComponent],
  templateUrl: './admin-dashboard.component.html',
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
