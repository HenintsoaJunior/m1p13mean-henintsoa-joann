import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Centre, Batiment, Etage, Emplacement } from '../../../shared/interfaces/centre.interface';
import { CentreService } from '../../../shared/services/centre.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-plan-centre',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './plan-centre.html',
  styleUrls: ['./plan-centre.css'],
})
export class PlanCentreComponent implements OnInit {
  centres: Centre[] = [];
  batiments: Batiment[] = [];
  etages: Etage[] = [];
  emplacements: Emplacement[] = [];
  selectedCentre: Centre | null = null;
  selectedBatiment: Batiment | null = null;
  selectedEtageForPopup: Etage | null = null;
  showEmplacementsPopup = false;
  loading = false;
  error: string | null = null;

  constructor(
    private centreService: CentreService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.loadCentres();
  }

  private loadCentres() {
    this.loading = true;
    this.centreService.getAllCentres().subscribe({
      next: (response) => {
        if (response.success && response.data.centres) {
          this.centres = response.data.centres;
          if (this.centres.length > 0) {
            this.selectedCentre = this.centres[0];
            this.loadCentreDetails(this.selectedCentre._id);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des centres:', error);
        this.error = 'Erreur lors du chargement des centres';
        this.loading = false;
        // Fallback vers les données mock en cas d'erreur
        this.loadMockData();
      }
    });
  }

  private loadCentreDetails(centreId: string) {
    this.loading = true;
    this.centreService.getCentreWithPlan(centreId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.selectedCentre = data.centre;
          this.batiments = data.batiments || [];
          
          // Extraire les étages et emplacements des bâtiments
          this.etages = [];
          this.emplacements = [];
          
          this.batiments.forEach(batiment => {
            if (batiment.etages) {
              batiment.etages.forEach((etage: Etage) => {
                this.etages.push(etage);
                if (etage.emplacements) {
                  this.emplacements.push(...etage.emplacements);
                }
              });
            }
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du plan:', error);
        this.error = 'Erreur lors du chargement du plan';
        this.loading = false;
        // Fallback vers les données mock en cas d'erreur
        this.loadMockData();
      }
    });
  }

  onCentreChange(centre: Centre) {
    this.selectedCentre = centre;
    this.selectedBatiment = null;
    this.loadCentreDetails(centre._id);
  }

  private loadMockData() {
    // Données mock pour le centre
    this.centres = [
      {
        _id: '1',
        nom: 'Akoor Antananarivo',
        slug: 'akoor-antananarivo',
        adresse: {
          rue: '123 Avenue de l\'Indépendance',
          ville: 'Antananarivo',
          code_postal: '101',
          pays: 'Madagascar',
          coordonnees: { type: 'Point', coordinates: [-18.8792, 47.5079] }
        },
        description: 'Centre commercial moderne au cœur d\'Antananarivo',
        horaires_ouverture: new Map([
          ['lundi', '08:00-20:00'],
          ['mardi', '08:00-20:00'],
          ['mercredi', '08:00-20:00'],
          ['jeudi', '08:00-20:00'],
          ['vendredi', '08:00-20:00'],
          ['samedi', '08:00-21:00'],
          ['dimanche', '09:00-18:00']
        ]),
        email_contact: 'contact@akoor-antananarivo.mg',
        telephone_contact: '+261 20 22 123 45',
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      }
    ];

    // Données mock pour les bâtiments
    this.batiments = [
      {
        _id: '1',
        centre_id: '1',
        nom: 'Bâtiment Principal',
        description: 'Le bâtiment principal du centre commercial avec tous les grands magasins',
        nombre_etages: 3,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '2',
        centre_id: '1',
        nom: 'Annexe Nord',
        description: 'Bâtiment annexe pour les boutiques spécialisées',
        nombre_etages: 2,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '3',
        centre_id: '1',
        nom: 'Espace Restauration',
        description: 'Zone dédiée à la restauration et aux loisirs',
        nombre_etages: 1,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      }
    ];

    // Données mock pour les étages
    this.etages = [
      // Bâtiment Principal
      {
        _id: '1',
        batiment_id: '1',
        nom: 'Rez-de-chaussée',
        niveau: 0,
        surface_totale_m2: 2500,
        hauteur_sous_plafond_m: 4.5,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '2',
        batiment_id: '1',
        nom: '1er étage',
        niveau: 1,
        surface_totale_m2: 2200,
        hauteur_sous_plafond_m: 3.8,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '3',
        batiment_id: '1',
        nom: '2ème étage',
        niveau: 2,
        surface_totale_m2: 2000,
        hauteur_sous_plafond_m: 3.5,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      // Annexe Nord
      {
        _id: '4',
        batiment_id: '2',
        nom: 'Rez-de-chaussée',
        niveau: 0,
        surface_totale_m2: 1500,
        hauteur_sous_plafond_m: 4.0,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '5',
        batiment_id: '2',
        nom: '1er étage',
        niveau: 1,
        surface_totale_m2: 1400,
        hauteur_sous_plafond_m: 3.5,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      // Espace Restauration
      {
        _id: '6',
        batiment_id: '3',
        nom: 'Rez-de-chaussée',
        niveau: 0,
        surface_totale_m2: 800,
        hauteur_sous_plafond_m: 5.0,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      }
    ];

    // Sélectionner le premier centre par défaut
    if (this.centres.length > 0) {
      this.selectedCentre = this.centres[0];
    }

    // Données mock pour les emplacements
    this.emplacements = [
      // RDC Bâtiment Principal
      {
        _id: '1',
        etage_id: '1',
        code: 'A-01',
        type: 'box',
        nom: 'Boutique Mode',
        surface_m2: 120,
        position: {
          type: 'polygone',
          coordonnees: [[10, 10], [130, 10], [130, 80], [10, 80]]
        },
        statut: 'occupe',
        loyer_mensuel: 2500,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '2',
        etage_id: '1',
        code: 'A-02',
        type: 'kiosque',
        nom: 'Point Info',
        surface_m2: 25,
        position: {
          type: 'polygone',
          coordonnees: [[150, 20], [200, 20], [200, 60], [150, 60]]
        },
        statut: 'libre',
        loyer_mensuel: 800,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '3',
        etage_id: '1',
        code: 'A-03',
        type: 'box',
        nom: 'Électronique',
        surface_m2: 85,
        position: {
          type: 'polygone',
          coordonnees: [[220, 15], [300, 15], [300, 70], [220, 70]]
        },
        statut: 'reserve',
        loyer_mensuel: 1800,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      // 1er étage Bâtiment Principal
      {
        _id: '4',
        etage_id: '2',
        code: 'B-01',
        type: 'box',
        nom: 'Restauration',
        surface_m2: 150,
        position: {
          type: 'polygone',
          coordonnees: [[20, 20], [170, 20], [170, 90], [20, 90]]
        },
        statut: 'occupe',
        loyer_mensuel: 3200,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '5',
        etage_id: '2',
        code: 'B-02',
        type: 'zone_loisirs',
        nom: 'Espace Jeux',
        surface_m2: 200,
        position: {
          type: 'polygone',
          coordonnees: [[190, 10], [350, 10], [350, 110], [190, 110]]
        },
        statut: 'en_travaux',
        loyer_mensuel: 4000,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      // 2ème étage Bâtiment Principal
      {
        _id: '6',
        etage_id: '3',
        code: 'C-01',
        type: 'box',
        nom: 'Bureau Admin',
        surface_m2: 80,
        position: {
          type: 'polygone',
          coordonnees: [[30, 30], [120, 30], [120, 80], [30, 80]]
        },
        statut: 'occupe',
        loyer_mensuel: 1500,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      // RDC Annexe Nord
      {
        _id: '7',
        etage_id: '4',
        code: 'D-01',
        type: 'pop_up',
        nom: 'Stand Événement',
        surface_m2: 40,
        position: {
          type: 'polygone',
          coordonnees: [[15, 15], [80, 15], [80, 55], [15, 55]]
        },
        statut: 'en_negociation',
        loyer_mensuel: 1200,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      },
      {
        _id: '8',
        etage_id: '4',
        code: 'D-02',
        type: 'box',
        nom: 'Parfumerie',
        surface_m2: 60,
        position: {
          type: 'polygone',
          coordonnees: [[100, 20], [180, 20], [180, 70], [100, 70]]
        },
        statut: 'libre',
        loyer_mensuel: 1600,
        cree_le: new Date('2023-01-15'),
        modifie_le: new Date('2024-01-15')
      }
    ];
  }

  selectBatiment(batiment: Batiment) {
    this.selectedBatiment = this.selectedBatiment?._id === batiment._id ? null : batiment;
  }

  getBatimentsForCentre(): Batiment[] {
    if (!this.selectedCentre) return [];
    return this.batiments.filter(b => b.centre_id === this.selectedCentre!._id);
  }

  getEtagesForBatiment(batimentId: string): Etage[] {
    return this.etages.filter(e => e.batiment_id === batimentId).sort((a, b) => a.niveau - b.niveau);
  }

  getTotalSurface(): number {
    return this.etages.reduce((total, etage) => total + etage.surface_totale_m2, 0);
  }

  getEtageColor(index: number): string {
    const colors = [
      'var(--sidebar-primary)',
      'var(--color-green-600)', 
      'var(--color-amber-500)',
      'var(--color-gray-600)'
    ];
    return colors[index % colors.length];
  }

  getEmplacementsForEtage(etageId: string): Emplacement[] {
    return this.emplacements.filter(e => e.etage_id === etageId);
  }

  getStatutColor(statut: string): string {
    const colors = {
      'libre': 'var(--color-green-600)',
      'occupe': 'var(--sidebar-primary)',
      'reserve': 'var(--color-amber-500)',
      'en_travaux': 'var(--color-red-600)',
      'en_negociation': 'var(--color-gray-500)'
    };
    return colors[statut as keyof typeof colors] || 'var(--color-gray-400)';
  }

  getPolygonPoints(coordonnees: number[][]): string {
    return coordonnees.map(point => `${point[0]},${point[1]}`).join(' ');
  }

  // Fonctions pour la popup des emplacements
  openEmplacementsPopup(etage: Etage) {
    this.selectedEtageForPopup = etage;
    this.showEmplacementsPopup = true;
  }

  closeEmplacementsPopup() {
    this.showEmplacementsPopup = false;
    this.selectedEtageForPopup = null;
  }

  // Méthodes de normalisation optimisées
  private getNormalizationParams(etageId: string) {
    const emplacements = this.getEmplacementsForEtage(etageId);
    if (emplacements.length === 0) return { scaleX: 2, scaleY: 2, scale: 2 };
    
    const allCoords = emplacements.flatMap(e => e.position.coordonnees);
    const maxX = Math.max(...allCoords.map(coord => coord[0]));
    const maxY = Math.max(...allCoords.map(coord => coord[1]));
    const minX = Math.min(...allCoords.map(coord => coord[0]));
    const minY = Math.min(...allCoords.map(coord => coord[1]));
    
    const scaleX = Math.min(2.5, (730) / (maxX - minX + 100));
    const scaleY = Math.min(2.5, (430) / (maxY - minY + 100));
    const scale = Math.min(scaleX, scaleY);
    
    return { scaleX, scaleY, scale, minX, minY, maxX, maxY };
  }

  getScaledPolygonPoints(coordonnees: number[][]): string {
    if (!this.selectedEtageForPopup) return '';
    
    const params = this.getNormalizationParams(this.selectedEtageForPopup._id);
    const scaledCoords = coordonnees.map(coord => [
      Math.max(60, Math.min(740, (coord[0] * params.scale) + 60)),
      Math.max(60, Math.min(440, (coord[1] * params.scale) + 60))
    ]);
    return scaledCoords.map(point => `${point[0]},${point[1]}`).join(' ');
  }

  getScaledEmplacementCenterX(emplacement: Emplacement): number {
    if (!this.selectedEtageForPopup) return 0;
    
    const params = this.getNormalizationParams(this.selectedEtageForPopup._id);
    const centerX = emplacement.position.coordonnees.reduce((sum, point) => sum + point[0], 0) / emplacement.position.coordonnees.length;
    return Math.max(60, Math.min(740, (centerX * params.scale) + 60));
  }

  getScaledEmplacementCenterY(emplacement: Emplacement): number {
    if (!this.selectedEtageForPopup) return 0;
    
    const params = this.getNormalizationParams(this.selectedEtageForPopup._id);
    const centerY = emplacement.position.coordonnees.reduce((sum, point) => sum + point[1], 0) / emplacement.position.coordonnees.length;
    return Math.max(60, Math.min(440, (centerY * params.scale) + 60));
  }

  getEmplacementCenterX(emplacement: Emplacement): number {
    const coords = emplacement.position.coordonnees;
    return coords.reduce((sum, point) => sum + point[0], 0) / coords.length;
  }

  getEmplacementCenterY(emplacement: Emplacement): number {
    const coords = emplacement.position.coordonnees;
    return coords.reduce((sum, point) => sum + point[1], 0) / coords.length;
  }

  getTypeDisplayName(type: string): string {
    const types = {
      'box': 'Boutique',
      'kiosque': 'Kiosque',
      'zone_loisirs': 'Zone Loisirs',
      'zone_commune': 'Zone Commune',
      'pop_up': 'Pop-up',
      'autre': 'Autre'
    };
    return types[type as keyof typeof types] || type;
  }

  getStatutDisplayName(statut: string): string {
    const statuts = {
      'libre': 'Libre',
      'occupe': 'Occupé',
      'reserve': 'Réservé',
      'en_travaux': 'En travaux',
      'en_negociation': 'En négociation'
    };
    return statuts[statut as keyof typeof statuts] || statut;
  }

  // Méthodes pour compter les emplacements par statut
  getEmplacementsLibresCount(etageId: string): number {
    return this.getEmplacementsForEtage(etageId).filter(e => e.statut === 'libre').length;
  }

  getEmplacementsOccupesCount(etageId: string): number {
    return this.getEmplacementsForEtage(etageId).filter(e => e.statut === 'occupe').length;
  }

  getEmplacementsAutresCount(etageId: string): number {
    return this.getEmplacementsForEtage(etageId).filter(e => !['libre', 'occupe'].includes(e.statut)).length;
  }
}
