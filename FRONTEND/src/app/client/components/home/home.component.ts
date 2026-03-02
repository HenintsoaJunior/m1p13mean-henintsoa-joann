import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { AppelsOffreClientComponent } from '../appels-offre/appels-offre-client.component';
import { PanierService, PanierItem } from '../../services/panier.service';
import { SouhaitService } from '../../services/souhait.service';
import { ProduitClient } from '../../services/produit-client.service';
import { ClientProduitListComponent } from '../produits/produit-list.component';
import { FilterService } from '../../services/filter.service';
import { CentreContactComponent } from '../centre-contact/centre-contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, AppelsOffreClientComponent, ClientProduitListComponent, CentreContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private filterService = inject(FilterService);
  panierService = inject(PanierService);
  souhaitService = inject(SouhaitService);

  showLogoutPopup = false;
  activeTab = 'produits';

  // Right drawer
  activeSidebar: 'panier' | 'souhait' | null = null;
  panierItems: PanierItem[] = [];
  souhaitItems: ProduitClient[] = [];

  private subs = new Subscription();
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.subs.add(this.panierService.items$.subscribe(items => this.panierItems = items));
    this.subs.add(this.souhaitService.items$.subscribe(items => this.souhaitItems = items));

    // Wire search input with debounce to FilterService
    this.searchInput$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => this.filterService.setSearch(q));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchInput$.next(q);
  }

  openSidebar(type: 'panier' | 'souhait'): void { this.activeSidebar = type; }
  closeSidebar(): void { this.activeSidebar = null; }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nom || user?.prenom || user?.email || 'Utilisateur';
  }

  get panierCount(): number { return this.panierService.count; }
  get souhaitCount(): number { return this.souhaitService.count; }

  get panierTotal(): number {
    return this.panierItems.reduce((total, item) => {
      const prix = this.getPrixVariante(item);
      return total + prix * item.quantite;
    }, 0);
  }

  getPrixVariante(item: PanierItem): number {
    const variante = item.produit.variantes?.[item.varianteIndex];
    const prixBase = variante?.prix?.montant ?? 0;
    
    // Appliquer la promotion si elle existe
    if (item.produit.promotion) {
      const promo = item.produit.promotion;
      if (promo.type === 'pourcentage') {
        return Math.max(0, Math.round(prixBase * (1 - promo.valeur / 100)));
      }
      if (promo.type === 'montant') {
        return Math.max(0, prixBase - promo.valeur);
      }
    }
    return prixBase;
  }

  getLibelleVariante(item: PanierItem): string {
    const v = item.produit.variantes?.[item.varianteIndex];
    if (!v) return '';
    return [v.couleur, v.unite].filter(Boolean).join(' / ');
  }

  getPrixMin(produit: ProduitClient): number {
    if (!produit.variantes || produit.variantes.length === 0) return 0;
    return Math.min(...produit.variantes.map(v => v.prix?.montant || 0));
  }

  ajouterSouhaitAuPanier(produit: ProduitClient): void {
    this.panierService.ajouter(produit, 0);
    this.souhaitService.basculer(produit);
  }

  onProfileClick() {
    if (this.isLoggedIn) {
      this.showLogoutPopup = true;
    } else {
      this.router.navigate(['/client-login']);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showLogoutPopup = false;
  }

  closePopup() {
    this.showLogoutPopup = false;
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      const firstName = user.prenom ? user.prenom.charAt(0).toUpperCase() : '';
      const lastName = user.nom ? user.nom.charAt(0).toUpperCase() : '';
      return firstName + lastName || 'U';
    }
    return 'U';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || '';
  }
}
