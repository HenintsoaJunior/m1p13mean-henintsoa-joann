import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentresService, Emplacement, Etage } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-emplacements-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './emplacements-crud.component.html',
  styleUrls: ['./emplacements-crud.component.scss']
})
export class EmplacementsCrudComponent implements OnInit {
  emplacements: Emplacement[] = [];
  filteredEmplacements: Emplacement[] = [];
  etages: Etage[] = [];
  batiments: any[] = [];
  centres: any[] = [];
  searchTerm = '';
  selectedEtageId = '';
  selectedStatut = '';
  showModal = false;
  editingEmplacement: Emplacement | null = null;
  isSubmitting = false;
  emplacementForm: FormGroup;
  coordonnees: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(
    private centresService: CentresService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.emplacementForm = this.formBuilder.group({
      etage_id: ['', [Validators.required]],
      code: ['', [Validators.required]],
      nom: [''],
      type: ['', [Validators.required]],
      statut: ['libre', [Validators.required]],
      surface_m2: [null],
      loyer_mensuel: [null],
      position: this.formBuilder.group({
        type: ['polygone'],
        coordonnees: [[]]
      })
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.centresService.getAllCentres().subscribe(centres => {
      this.centres = centres;
    });

    this.centresService.getBatiments().subscribe(batiments => {
      this.batiments = batiments;
    });

    this.centresService.getEtages().subscribe(etages => {
      this.etages = etages;
    });

    this.loadEmplacements();
  }

  loadEmplacements() {
    this.centresService.getEmplacementsPaginated(this.currentPage, this.pageSize).subscribe((response: any) => {
      if (response && response.success && response.data) {
        const data = response.data;
        this.emplacements = data.emplacements || data.docs || (Array.isArray(data) ? data : []);
        this.totalItems = data.total || 0;
        this.totalPages = data.pages || 0;
        this.currentPage = data.page || this.currentPage;
      } else if (Array.isArray(response)) {
        this.emplacements = response;
        this.totalItems = response.length;
        this.totalPages = 1;
      }
      this.filterEmplacements();
    });
  }

  filterByEtage() {
    this.filterEmplacements();
  }

  filterEmplacements() {
    console.log('Filtrage des emplacements:', {
      total: this.emplacements.length,
      searchTerm: this.searchTerm,
      selectedEtageId: this.selectedEtageId,
      selectedStatut: this.selectedStatut
    });

    this.filteredEmplacements = this.emplacements.filter(emplacement => {
      const matchesSearch = emplacement.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          emplacement.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          emplacement.type.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Gérer le cas où etage_id est un objet ou une chaîne
      const etageId = typeof emplacement.etage_id === 'object' && emplacement.etage_id !== null
        ? (emplacement.etage_id as any)._id
        : emplacement.etage_id;
      const matchesEtage = !this.selectedEtageId || etageId === this.selectedEtageId;

      const matchesStatut = !this.selectedStatut || emplacement.statut === this.selectedStatut;

      return matchesSearch && matchesEtage && matchesStatut;
    });

    console.log('Emplacements filtrés:', this.filteredEmplacements.length);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedEtageId = '';
    this.selectedStatut = '';
    this.filterEmplacements();
  }

  getEtageNom(etageId: string | { _id: string; nom: string }): string {
    // Si c'est un objet populé, on retourne directement le nom
    if (typeof etageId === 'object' && etageId !== null) {
      return etageId.nom;
    }
    // Sinon, on cherche dans la liste des étages
    const etage = this.etages.find(e => e._id === etageId);
    return etage ? etage.nom : 'Étage inconnu';
  }

  openCreateModal() {
    this.editingEmplacement = null;
    this.emplacementForm.reset();
    this.emplacementForm.patchValue({ 
      statut: 'libre',
      position: { type: 'polygone', coordonnees: [] }
    });
    this.coordonnees = '';
    this.showModal = true;
  }

  // Obtenir le nom complet d'un étage avec bâtiment et centre
  getEtageFullName(etage: Etage): string {
    const batimentId = typeof etage.batiment_id === 'object' ? etage.batiment_id._id : etage.batiment_id;
    const batiment = this.batiments.find(b => b._id === batimentId);
    
    if (batiment) {
      const centreId = typeof batiment.centre_id === 'object' ? batiment.centre_id._id : batiment.centre_id;
      const centre = this.centres.find(c => c._id === centreId);
      
      if (centre) {
        return `${etage.nom} - ${batiment.nom} - ${centre.nom}`;
      }
      return `${etage.nom} - ${batiment.nom}`;
    }
    
    return etage.nom;
  }

  // Parser les coordonnées depuis le texte
  parseCoordonneesFromText() {
    try {
      if (!this.coordonnees.trim()) {
        this.emplacementForm.patchValue({
          position: { type: 'polygone', coordonnees: [] }
        });
        return;
      }

      // Format attendu: "10,10 100,10 100,100 10,100" ou [[10,10],[100,10],[100,100],[10,100]]
      let coords: number[][] = [];
      
      if (this.coordonnees.includes('[')) {
        // Format JSON
        coords = JSON.parse(this.coordonnees);
      } else {
        // Format texte: "x1,y1 x2,y2 x3,y3"
        const points = this.coordonnees.trim().split(/\s+/);
        coords = points.map(point => {
          const [x, y] = point.split(',').map(Number);
          return [x, y];
        });
      }

      this.emplacementForm.patchValue({
        position: { type: 'polygone', coordonnees: coords }
      });
    } catch (error) {
      this.toastService.showError('Format de coordonnées invalide');
    }
  }

  editEmplacement(emplacement: Emplacement) {
    this.editingEmplacement = emplacement;
    // Extraire l'ID si etage_id est un objet populé
    const etageId = typeof emplacement.etage_id === 'object' ? emplacement.etage_id._id : emplacement.etage_id;
    
    // Convertir les coordonnées en texte pour l'affichage
    if (emplacement.position?.coordonnees) {
      this.coordonnees = emplacement.position.coordonnees
        .map(coord => `${coord[0]},${coord[1]}`)
        .join(' ');
    } else {
      this.coordonnees = '';
    }
    
    this.emplacementForm.patchValue({
      ...emplacement,
      etage_id: etageId
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEmplacement = null;
    this.coordonnees = '';
    this.emplacementForm.reset();
    this.emplacementForm.patchValue({ 
      statut: 'libre',
      position: { type: 'polygone', coordonnees: [] }
    });
  }

  onSubmit() {
    if (this.emplacementForm.valid) {
      this.isSubmitting = true;
      // Parser les coordonnées avant l'envoi si elles n'ont pas été parsées
      if (this.coordonnees.trim()) {
        this.parseCoordonneesFromText();
      }
      
      const emplacementData = this.emplacementForm.getRawValue();
      
      // S'assurer que position est bien formaté ou le retirer si vide
      if (!emplacementData.position?.coordonnees || emplacementData.position.coordonnees.length === 0) {
        delete emplacementData.position;
      }
      
      console.log('Données à envoyer:', JSON.stringify(emplacementData, null, 2));

      if (this.editingEmplacement) {
        this.centresService.updateEmplacement(this.editingEmplacement._id!, emplacementData).subscribe({
          next: (response) => {
            console.log('Emplacement modifié:', response);
            this.loadEmplacements();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Emplacement modifié avec succès!');
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification de l\'emplacement');
          }
        });
      } else {
        this.centresService.createEmplacement(emplacementData).subscribe({
          next: (response) => {
            console.log('Emplacement créé - Réponse complète:', response);
            this.loadEmplacements();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Emplacement créé avec succès!');
          },
          error: (error) => {
            console.error('Erreur création - Détails:', error);
            console.error('Erreur message:', error.error?.message || error.message);
            this.isSubmitting = false;
            this.toastService.showError(error.error?.message || 'Erreur lors de la création de l\'emplacement');
          }
        });
      }
    } else {
      console.log('Formulaire invalide:');
      Object.keys(this.emplacementForm.controls).forEach(key => {
        const control = this.emplacementForm.get(key);
        if (control?.invalid) {
          console.log(`  - ${key}:`, control.errors);
        }
      });
      this.toastService.showError('Veuillez remplir tous les champs requis');
    }
  }

  deleteEmplacement(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      this.centresService.deleteEmplacement(id).subscribe({
        next: () => {
          this.loadEmplacements();
          this.toastService.showSuccess('Emplacement supprimé avec succès!');
        },
        error: () => {
          this.toastService.showError('Erreur lors de la suppression de l\'emplacement');
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEmplacements();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadEmplacements();
  }

  get pages(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
