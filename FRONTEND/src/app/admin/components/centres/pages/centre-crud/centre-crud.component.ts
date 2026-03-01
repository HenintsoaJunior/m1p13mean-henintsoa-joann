import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CentresService, Centre } from '../../services/centres.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-centre-crud',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './centre-crud.component.html',
  styleUrls: ['./centre-crud.component.scss']
})
export class CentreCrudComponent implements OnInit {
  centres: Centre[] = [];
  filteredCentres: Centre[] = [];
  searchTerm = '';
  showModal = false;
  editingCentre: Centre | null = null;
  isLoading = false;
  isSubmitting = false;
  centreForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

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
    this.centreForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      description: [''],
      email_contact: ['', [Validators.email]],
      telephone_contact: [''],
      image_url: ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop'],
      adresse: this.formBuilder.group({
        rue: [''],
        ville: [''],
        code_postal: [''],
        pays: ['Madagascar'],
      }),
    });
  }

  ngOnInit() {
    this.loadCentres();
  }

  loadCentres() {
    this.isLoading = true;
    this.centresService.getCentres(this.currentPage, this.pageSize).subscribe((response: any) => {
      if (response && response.success && response.data) {
        const data = response.data;
        this.centres = data.centres || data.docs || (Array.isArray(data) ? data : []);
        this.totalItems = data.total || 0;
        this.totalPages = data.pages || 0;
        this.currentPage = data.page || this.currentPage;
      } else if (Array.isArray(response)) {
        this.centres = response;
        this.totalItems = response.length;
        this.totalPages = 1;
      }
      this.filteredCentres = this.centres;
      if (this.searchTerm) {
        this.filterCentres();
      }
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  filterCentres() {
    this.filteredCentres = this.centres.filter(
      (centre) =>
        centre.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        centre.adresse?.ville?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        centre.email_contact?.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCentres();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadCentres();
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openCreateModal() {
    this.editingCentre = null;
    this.centreForm.reset();
    this.imagePreview = null;
    this.selectedFile = null;
    this.centreForm.patchValue({
      adresse: { pays: 'Madagascar' },
      image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop'
    });
    this.imagePreview = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop';
    this.showModal = true;
  }

  // Générer le slug à partir du nom
  generateSlug() {
    const nom = this.centreForm.get('nom')?.value;
    if (nom) {
      const slug = nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par -
        .replace(/^-+|-+$/g, ''); // Enlever les - au début et à la fin
      this.centreForm.patchValue({ slug });
    }
  }

  // Gérer la sélection de fichier
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.toastService.showError('Veuillez sélectionner une image valide');
        return;
      }

      // Vérifier la taille (max 2MB pour éviter les problèmes)
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.showError('L\'image ne doit pas dépasser 2MB');
        return;
      }

      this.selectedFile = file;

      // Créer un aperçu et compresser l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Créer un canvas pour redimensionner/compresser
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionner si trop grand (max 1200px de largeur)
          const maxWidth = 1200;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convertir en base64 avec compression (qualité 0.8)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          this.imagePreview = compressedBase64;
          this.centreForm.patchValue({ image_url: compressedBase64 });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editCentre(centre: Centre) {
    this.editingCentre = centre;
    this.centreForm.patchValue(centre);
    this.imagePreview = centre.image_url || null;
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCentre = null;
    this.imagePreview = null;
    this.selectedFile = null;
    this.centreForm.reset();
  }

  onSubmit() {
    if (this.centreForm.valid) {
      this.isSubmitting = true;
      const centreData = this.centreForm.value;

      if (this.editingCentre) {
        this.centresService.updateCentre(this.editingCentre._id!, centreData).subscribe({
          next: () => {
            this.loadCentres();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Centre modifié avec succès!');
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la modification du centre');
          },
        });
      } else {
        this.centresService.createCentre(centreData).subscribe({
          next: () => {
            this.loadCentres();
            this.closeModal();
            this.isSubmitting = false;
            this.toastService.showSuccess('Centre créé avec succès!');
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastService.showError('Erreur lors de la création du centre');
          },
        });
      }
    }
  }

  deleteCentre(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce centre ?')) {
      this.centresService.deleteCentre(id).subscribe({
        next: () => {
          this.loadCentres();
          this.toastService.showSuccess('Centre supprimé avec succès!');
        },
        error: (error) => {
          this.toastService.showError('Erreur lors de la suppression du centre');
        }
      });
    }
  }
}
