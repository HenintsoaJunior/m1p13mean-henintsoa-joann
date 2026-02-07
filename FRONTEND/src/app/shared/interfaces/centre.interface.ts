export interface Utilisateur {
  _id: string;
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
  telephone: string;
  role: 'admin' | 'boutique' | 'client';
  actif: boolean;
  cree_le: Date;
  modifie_le: Date;
  token_reinitialisation_mdp?: string;
  expiration_reinitialisation_mdp?: Date;
}

export interface Logs {
  id: string;
  id_utilisateur: string;
  details: string;
  datetime: Date;
}

export interface Adresse {
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  coordonnees: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface Centre {
  _id: string;
  nom: string;
  slug: string;
  adresse: Adresse;
  description: string;
  image_url?: string;
  horaires_ouverture: Map<string, string>;
  email_contact: string;
  telephone_contact: string;
  cree_le: Date;
  modifie_le: Date;
}

export interface Batiment {
  _id: string;
  centre_id: string;
  nom: string;
  description: string;
  nombre_etages: number;
  cree_le: Date;
  modifie_le: Date;
  etages?: Etage[]; // Propriété optionnelle ajoutée pour les données enrichies
}

export interface Etage {
  _id: string;
  batiment_id: string;
  nom: string;
  niveau: number;
  surface_totale_m2: number;
  hauteur_sous_plafond_m: number;
  cree_le: Date;
  modifie_le: Date;
  emplacements?: Emplacement[]; // Propriété optionnelle ajoutée pour les données enrichies
}

export interface Position {
  type: 'polygone' | 'point';
  coordonnees: number[][];
}

export interface Emplacement {
  _id: string;
  etage_id: string;
  code: string;
  type: 'box' | 'kiosque' | 'zone_loisirs' | 'zone_commune' | 'pop_up' | 'autre';
  nom: string;
  surface_m2: number;
  position: Position;
  statut: 'libre' | 'occupe' | 'reserve' | 'en_travaux' | 'en_negociation';
  loyer_mensuel: number;
  cree_le: Date;
  modifie_le: Date;
}

export interface AppelOffre {
  _id: string;
  id_emplacement: string;
  date_appel: Date;
  description: string;
  status: string;
}

export interface Contact {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
}

export interface Boutique {
  _id: string;
  id_appel_offre: string;
  contact: Contact;
  status: string;
}