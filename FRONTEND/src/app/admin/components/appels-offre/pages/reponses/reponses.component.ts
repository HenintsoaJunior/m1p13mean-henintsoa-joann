import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReponsesService, ReponseDto } from '../../services/reponses.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-reponses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reponses.component.html',
  styleUrls: ['./reponses.component.css']
})
export class ReponsesComponent implements OnInit {
  appelId: string | null = null;
  reponses: ReponseDto[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private reponseSvc: ReponsesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Lecture depuis snapshot + params observables pour couvrir tous les cas
    this.appelId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('appelId') ||
      this.route.snapshot.params['id'] ||
      null;

    if (this.appelId) {
      this.loadReponses();
    } else {
      // Fallback : écouter les params en asynchrone
      this.route.params.subscribe(params => {
        const id = params['id'] || params['appelId'];
        if (id && id !== this.appelId) {
          this.appelId = id;
          this.loadReponses();
        }
      });
    }
  }

  loadReponses() {
    if (!this.appelId) return;
    this.loading = true;
    this.reponseSvc.getReponsesByAppel(this.appelId).subscribe({
      next: (res) => {
        this.reponses = res?.data?.reponses ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getStatutLabel(statut?: string): string {
    return { propose: 'Proposé', accepte: 'Accepté', refuse: 'Refusé' }[statut ?? ''] ?? (statut ?? '—');
  }

  accept(id: string | undefined) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr d\'accepter cette réponse ?')) return;
    this.reponseSvc.acceptReponse(id).subscribe({
      next: () => { this.toastService.showSuccess('Réponse acceptée avec succès'); this.loadReponses(); },
      error: (e) => this.toastService.showError(e.error?.message || 'Erreur acceptation'),
    });
  }

  refuse(id: string | undefined) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de refuser cette réponse ?')) return;
    this.reponseSvc.refuseReponse(id).subscribe({
      next: () => { this.toastService.showSuccess('Réponse refusée'); this.loadReponses(); },
      error: (e) => this.toastService.showError(e.error?.message || 'Erreur refus'),
    });
  }
}
