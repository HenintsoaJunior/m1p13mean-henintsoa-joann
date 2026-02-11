import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CardComponent, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  roles = [
    {
      id: 'admin',
      title: 'Administrateur',
      description: 'Accéder à toutes les fonctionnalités d\'administration',
      icon: '🔐',
      color: '#3660a9'
    },
    {
      id: 'boutique',
      title: 'Boutique',
      description: 'Gérer votre boutique et vos produits',
      icon: '🏪',
      color: '#fab548'
    },
    {
      id: 'client',
      title: 'Client',
      description: 'Parcourir les produits et effectuer des achats',
      icon: '🛍️',
      color: '#4ade80'
    }
  ];

  constructor(private router: Router) {}

  onSelectRole(roleId: string) {
    switch(roleId) {
      case 'admin':
        // Admin : page de login admin
        this.router.navigate(['/login']);
        break;
      case 'boutique':
        // Boutique : page de login spécifique
        this.router.navigate(['/boutique-login']);
        break;
      case 'client':
        // Client : page d'accueil client
        this.router.navigate(['/client/accueil']);
        break;
      default:
        console.warn('Rôle inconnu sélectionné:', roleId);
    }
  }
}