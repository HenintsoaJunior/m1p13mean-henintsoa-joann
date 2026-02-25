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
    couleur?: string | null;
    taille?: string[];
    marque?: string | null;
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
    couleur?: string;
    taille?: string[];
    marque?: string;
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
