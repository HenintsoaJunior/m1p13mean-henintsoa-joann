export interface LoginRequest {
  email: string;
  mot_de_passe: string; // ✅ Changé de 'password' à 'mot_de_passe'
}

export interface RegisterRequest {
  prenom: string; // ✅ Prénom requis
  nom: string;
  email: string;
  mot_de_passe: string; // ✅ Changé de 'password' à 'mot_de_passe'
  telephone?: string | null; // ✅ Accepter null aussi
  role?: string; // ✅ Ajouté rôle optionnel
  confirmPassword?: string; // Garde pour validation frontend uniquement
}

export interface AuthResponse {
  message: string;
  token?: string;
  utilisateur?: User;
}

export interface User {
  _id: string; // ✅ MongoDB utilise _id
  prenom: string;
  nom: string;
  email: string;
  role?: string;
  telephone?: string;
  createdAt?: Date;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}