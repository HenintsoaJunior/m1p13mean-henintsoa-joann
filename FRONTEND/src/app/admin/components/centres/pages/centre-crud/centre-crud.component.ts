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
  isSubmitting = false;
  centreForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

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
    this.centresService.getCentres().subscribe((centres) => {
      this.centres = centres;
      this.filteredCentres = centres;
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
