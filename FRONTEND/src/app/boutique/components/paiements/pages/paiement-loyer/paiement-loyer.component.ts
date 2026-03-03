import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaiementService, PaiementLoyer } from '../../services/paiement.service';
import { ToastService } from '../../../../../services/toast.service';
import { environment } from '../../../../../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-paiement-loyer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiement-loyer.component.html',
  styleUrls: ['./paiement-loyer.component.scss'],
})
export class PaiementLoyerComponent implements OnInit, OnDestroy {
  private paiementService = inject(PaiementService);
  private toastService = inject(ToastService);

  // État global
  isLoading = false;
  activeTab: 'payer' | 'historique' = 'payer';

  // Données mois courant
  moisCourant: any = null;
  moisSelectionne = '';

  // Stripe
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  clientSecret = '';
  isPaying = false;
  cardError = '';
  paiementSuccess = false;

  // Historique
  historique: PaiementLoyer[] = [];
  pagination: any = {};
  currentPage = 1;

  async ngOnInit() {
    this.setMoisCourant();
    await this.chargerStatutMoisCourant();
    this.chargerHistorique();
    this.stripe = await loadStripe(environment.stripePublicKey);
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  setMoisCourant() {
    const now = new Date();
    this.moisSelectionne = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async chargerStatutMoisCourant() {
    try {
      const res = await this.paiementService.getStatutMoisCourant().toPromise();
      this.moisCourant = res.data;
    } catch (err: any) {
      console.error('Erreur chargement statut:', err.message);
    }
  }

  chargerHistorique(page = 1) {
    this.paiementService.getHistorique(page).subscribe({
      next: (res) => {
        this.historique = res.data.paiements;
        this.pagination = res.data;
        this.currentPage = page;
      },
      error: (err) => console.error('Erreur historique:', err),
    });
  }

  async initierPaiement() {
    if (!this.moisSelectionne) {
      this.toastService.showError('Veuillez sélectionner un mois');
      return;
    }
    this.isLoading = true;
    this.cardError = '';

    try {
      const res = await this.paiementService.creerIntent(this.moisSelectionne).toPromise();
      this.clientSecret = res!.data.clientSecret;

      // Monter le Stripe Card Element
      setTimeout(() => this.mountCardElement(), 100);
    } catch (err: any) {
      this.toastService.showError(err.error?.message || 'Erreur lors de l\'initiation du paiement');
    } finally {
      this.isLoading = false;
    }
  }

  mountCardElement() {
    if (!this.stripe || !this.clientSecret) return;

    if (this.cardElement) {
      this.cardElement.destroy();
    }

    this.elements = this.stripe.elements({ clientSecret: this.clientSecret });
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#374151',
          '::placeholder': { color: '#9ca3af' },
        },
      },
    });
    this.cardElement.mount('#stripe-card-element');
    this.cardElement.on('change', (event: any) => {
      this.cardError = event.error ? event.error.message : '';
    });
  }

  async confirmerPaiement() {
    if (!this.stripe || !this.cardElement || !this.clientSecret) return;
    this.isPaying = true;
    this.cardError = '';

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (error) {
      this.cardError = error.message || 'Paiement échoué';
      this.toastService.showError('Paiement échoué : ' + error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      this.paiementSuccess = true;
      this.clientSecret = '';
      this.cardElement.destroy();
      this.cardElement = null;
      this.toastService.showSuccess('Paiement effectué avec succès ! La facture vous sera envoyée par email.');
      await this.chargerStatutMoisCourant();
      this.chargerHistorique();
    }
    this.isPaying = false;
  }

  annulerPaiement() {
    this.clientSecret = '';
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  getMoisLabel(mois: string): string {
    const [year, month] = mois.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'paye': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'echoue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'paye': return 'Payé';
      case 'en_attente': return 'En attente';
      case 'echoue': return 'Échoué';
      default: return 'Non payé';
    }
  }

  // Génère les 12 derniers mois comme options
  getMoisOptions(): { value: string; label: string }[] {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value, label: this.getMoisLabel(value) });
    }
    return options;
  }
}
