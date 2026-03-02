import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// ReponsesService import removed - not needed
import { AppelsOffreService, AppelOffreDto } from '../../services/appels-offre.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-response-form-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './response-form-client.component.html',
  styleUrl: './response-form-client.component.scss'
})

export class ResponseFormClientComponent implements OnInit {
  @Input() appel: AppelOffreDto | null = null;
  @Output() submitted = new EventEmitter<void>();

  appelId: string | null = null;
  // form fields and state
  emailProposeur = '';
  montant: number | undefined;
  message = '';
  nomBoutique = '';
  telephoneBoutique = '';
  adresseBoutique = '';
  
  loading = false;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // reponseSvc removed - not used
    private appelsOffreSvc: AppelsOffreService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // if appel not passed as input, read from route param
    if (!this.appel) {
      this.appelId = this.route.snapshot.paramMap.get('id');
      if (this.appelId) {
        this.loadAppelDetails();
        // don't load existing responses in the public form; 401 would occur
      }
    } else {
      // when appel input provided, set id for submission
      this.appelId = this.appel._id || null;
    }
  }

  loadAppelDetails(): void {
    if (!this.appelId) return;
    
    this.loading = true;
    this.appelsOffreSvc.getAppelOffre(this.appelId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.appel = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement appel:', err);
        this.toastService.showError('Erreur lors du chargement de l\'appel d\'offre');
        this.loading = false;
      }
    });
  }

  // loadReponses removed; public users should not fetch existing responses

  submit(): void {
    // Validation
    if (!this.emailProposeur) {
      this.toastService.showError('L\'adresse email est requis');
      return;
    }
    if (!this.montant || this.montant <= 0) {
      this.toastService.showError('Le montant proposé doit être supérieur à 0');
      return;
    }
    if (!this.message || this.message.trim().length === 0) {
      this.toastService.showError('Un message est requis');
      return;
    }
    if (!this.nomBoutique || this.nomBoutique.trim().length === 0) {
      this.toastService.showError('Le nom de la boutique est requis');
      return;
    }
    if (!this.appelId) {
      this.toastService.showError('Appel d\'offre non spécifié');
      return;
    }

    // Build payload
    const payload = {
      appel_offre_id: this.appelId,
      email_proposeur: this.emailProposeur,
      montant_propose: this.montant,
      message: this.message,
      nom_boutique: this.nomBoutique,
      telephone_boutique: this.telephoneBoutique || '',
      adresse_boutique: this.adresseBoutique || ''
    };

    // Submit using client service
    this.submitting = true;
    this.appelsOffreSvc.createReponse(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Réponse soumise avec succès ! 🎉');
        // Reset form
        this.emailProposeur = '';
        this.montant = undefined;
        this.message = '';
        this.nomBoutique = '';
        this.telephoneBoutique = '';
        this.adresseBoutique = '';
        this.submitting = false;
        // emit event for modal
        this.submitted.emit();
      },
      error: (err) => {
        this.submitting = false;
        const errorMsg = err.error?.message || err.message || 'Erreur lors de la création de la réponse';
        this.toastService.showError(errorMsg);
        console.error('Erreur création réponse:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/appels']);
  }
}
