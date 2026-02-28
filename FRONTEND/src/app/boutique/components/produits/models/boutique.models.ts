export interface Categorie {
  _id?: string;
  idBoutique?: string;
  nom: string;
  slug: string;
  description?: string | null;
  idCategorieParent?: string | null;
  urlImage?: string | null;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface CategorieFormData {
  nom: string;
  slug: string;
  description?: string;
  idCategorieParent?: string;
  urlImage?: string;
}

// Interfaces pour les attributs de produits
export interface TypeUnite {
  _id?: string;
  nom: 'standard' | 'liquide' | 'poids' | 'conditionnement' | 'personnalise';
  label: string;
  description?: string;
  icon?: string;
  valeurs?: string[];
  estActif?: boolean;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface TypeUniteFormData {
  nom: string;
  label: string;
  description?: string;
  icon?: string;
  valeurs?: string[];
  estActif?: boolean;
}

export interface Couleur {
  _id?: string;
  nom: string;
  codeHex: string;
  codeRgb?: {
    rouge: number;
    vert: number;
    bleu: number;
  };
  categorie?: 'neutre' | 'chaud' | 'froid' | 'vif' | 'pastel' | 'metallique' | 'fluo' | 'autre';
  estActif?: boolean;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface CouleurFormData {
  nom: string;
  codeHex: string;
  categorie?: string;
}

export interface Taille {
  _id?: string;
  valeur: string;
  label?: string;
  typeUnite: string | TypeUnite;
  ordre?: number;
  estStandard?: boolean;
  estActif?: boolean;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface TailleFormData {
  valeur: string;
  label?: string;
  typeUnite: string;
  ordre?: number;
  estStandard?: boolean;
  estActif?: boolean;
}

export interface Marque {
  _id?: string;
  nom: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  siteWeb?: string | null;
  estActif?: boolean;
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface MarqueFormData {
  nom: string;
  slug: string;
  description?: string;
  logo?: string;
  siteWeb?: string;
}

export interface Produit {
  _id?: string;
  idBoutique?: string;
  idCategorie: string | { _id: string; nom: string; slug?: string };
  nom: string;
  slug: string;
  description?: string | null;
  prix: {
    devise: string;
    montant: number;
  };
  stock: {
    quantite: number;
  };
  images?: string[];
  attributs?: {
    couleurs?: string[] | Couleur[];
    tailles?: string[] | Taille[];
    marque?: string | Marque | null;
    typeUnitePrincipal?: string | TypeUnite | null;
  };
  statut: 'actif' | 'rupture_stock' | 'archive';
  dateCreation?: Date;
  dateMiseAJour?: Date;
}

export interface ProduitFormData {
  idCategorie: string;
  nom: string;
  slug: string;
  description?: string;
  prix: {
    devise: string;
    montant: number;
  };
  stock: {
    quantite: number;
  };
  images?: string[];
  attributs?: {
    couleurs?: string[];
    tailles?: string[];
    marque?: string;
    typeUnitePrincipal?: string;
  };
  statut?: 'actif' | 'rupture_stock' | 'archive';
}

export interface PaginationResult<T> {
  produits?: T[];
  categories?: T[];
  pagination: {
    page: number;
    limite: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  erreur: string;
  message?: string;
}
