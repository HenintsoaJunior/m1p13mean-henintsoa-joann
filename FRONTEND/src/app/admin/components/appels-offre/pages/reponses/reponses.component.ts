import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReponsesService, ReponseDto } from '../../services/reponses.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-reponses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reponses.component.html',
  styleUrls: ['./reponses.component.css']
})
export class ReponsesComponent implements OnInit {
  appelId: string | null = null;
  reponses: ReponseDto[] = [];
  message = '';
  montant?: number;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private reponseSvc: ReponsesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.appelId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('appelId');
    if (this.appelId) this.loadReponses();
  }

  loadReponses() {
    if (!this.appelId) return;
    this.loading = true;
    this.reponseSvc.getReponsesByAppel(this.appelId).subscribe({
      next: (res) => {
        this.reponses = res && res.data && res.data.reponses ? res.data.reponses : [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  submit() {
    if (!this.appelId) {
      this.toastService.showError('Appel d\'offre non spécifié');
      return;
    }
    const payload: Partial<ReponseDto> = { appel_offre_id: this.appelId, message: this.message };
    if (this.montant !== undefined) payload.montant_propose = this.montant;
    this.reponseSvc.createReponse(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Réponse créée avec succès');
        this.message = '';
        this.montant = undefined;
        this.loadReponses();
      },
      error: (err) => this.toastService.showError(err.error?.message || err.message || 'Erreur création réponse'),
    });
  }

  accept(id: string | undefined) {
    if (!id) {
      this.toastService.showError('ID réponse introuvable');
      return;
    }
    if (!confirm('Êtes-vous sûr d\'accepter cette réponse ?')) return;
    this.reponseSvc.acceptReponse(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Réponse acceptée avec succès');
        this.loadReponses();
      },
      error: (e) => this.toastService.showError(e.error?.message || e.message || 'Erreur acceptation')
    });
  }

  refuse(id: string | undefined) {
    if (!id) {
      this.toastService.showError('ID réponse introuvable');
      return;
    }
    if (!confirm('Êtes-vous sûr de refuser cette réponse ?')) return;
    this.reponseSvc.refuseReponse(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Réponse refusée avec succès');
        this.loadReponses();
      },
      error: (e) => this.toastService.showError(e.error?.message || e.message || 'Erreur refus')
    });
  }
}
