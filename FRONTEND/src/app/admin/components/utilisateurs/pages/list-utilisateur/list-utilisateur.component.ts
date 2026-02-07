import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../../../../shared/interfaces/centre.interface';

@Component({
  selector: 'app-list-utilisateur',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule],
  templateUrl: './list-utilisateur.component.html',
  styleUrls: ['./list-utilisateur.component.scss']
})
export class ListUtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'actif', label: 'Statut' }
  ];

  // Filtres
  filtreNom: string = '';
  filtreEmail: string = '';
  filtreRole: string = '';
  filtreStatut: string = '';

  constructor(private utilisateurService: UtilisateurService) { }

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe(data => {
      this.utilisateurs = data;
      this.applyFilters();
    });
  }

  onStatusChange(utilisateur: Utilisateur, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStatus = input.checked;
    this.utilisateurService.updateUtilisateurStatus(utilisateur._id, newStatus).subscribe(() => {
      // Optionnel: afficher un toast/notification de succès
      // Recharger les données ou mettre à jour l'objet localement
      const index = this.utilisateurs.findIndex(u => u._id === utilisateur._id);
      if (index > -1) {
        this.utilisateurs[index].actif = newStatus;
        this.applyFilters(); // Réappliquer les filtres après changement de statut
      }
    });
  }

  applyFilters(): void {
    this.filteredUtilisateurs = this.utilisateurs.filter(utilisateur => {
      const correspondNom = !this.filtreNom || 
        utilisateur.nom.toLowerCase().includes(this.filtreNom.toLowerCase()) ||
        utilisateur.prenom.toLowerCase().includes(this.filtreNom.toLowerCase());
      
      const correspondEmail = !this.filtreEmail || 
        utilisateur.email.toLowerCase().includes(this.filtreEmail.toLowerCase());
      
      const correspondRole = !this.filtreRole || utilisateur.role === this.filtreRole;
      
      const correspondStatut = !this.filtreStatut || 
        (this.filtreStatut === 'actif' && utilisateur.actif) || 
        (this.filtreStatut === 'inactif' && !utilisateur.actif);

      return correspondNom && correspondEmail && correspondRole && correspondStatut;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filtreNom = '';
    this.filtreEmail = '';
    this.filtreRole = '';
    this.filtreStatut = '';
    this.applyFilters();
  }
}
