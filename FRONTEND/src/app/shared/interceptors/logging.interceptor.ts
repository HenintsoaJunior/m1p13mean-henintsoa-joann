import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Récupérer l'ancienne valeur via GET avant une modification/suppression
function fetchAncienneValeur(http: HttpClient, req: HttpRequest<unknown>, headers: any): Observable<any> {
  // Extraire l'URL de base pour faire un GET sur l'entité
  const url = req.url;
  const entityId = extractEntityIdFromRequest(req);
  
  if (!entityId) {
    return of(undefined);
  }

  // L'URL de la requête PUT/DELETE contient déjà l'ID, on peut faire un GET dessus
  return http.get<any>(url, { headers }).pipe(
    switchMap((response: any) => {
      if (response && response.success && response.data) {
        return of(response.data);
      }
      return of(response);
    }),
    catchError(() => of(undefined))
  );
}

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const logService = inject(LogService);
  const http = inject(HttpClient);

  // Ne pas logger les requêtes GET, les requêtes de logs, ni les requêtes d'authentification
  if (req.method === 'GET' || req.url.includes('/logs') || req.url.includes('/auth/')) {
    return next(req);
  }

  // Extraire les infos utilisateur
  const token = authService.getToken();
  
  // Check if token exists and is valid before processing
  if (!token || isTokenExpired(token)) {
    return next(req); // Skip logging if no token or token is expired
  }

  let utilisateurId = '0';
  let utilisateurRole = 'user'; // Default role

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    utilisateurId = payload.userId || payload.user_id || payload.sub || payload.id || '0';
    utilisateurRole = payload.role || 'user'; // Extract role from token
  } catch (e: any) {
    console.warn('Impossible de décoder le token:', e);
    return next(req); // Skip logging if token can't be decoded
  }

  // Seuls les administrateurs peuvent envoyer des logs à l'endpoint admin
  if (utilisateurRole !== 'admin') {
    return next(req); // Skip logging for non-admin users
  }

  // Déterminer le type d'action
  let action: string;
  switch (req.method) {
    case 'POST':
      action = 'CREATE';
      break;
    case 'PUT':
    case 'PATCH':
      action = 'UPDATE';
      break;
    case 'DELETE':
      action = 'DELETE';
      break;
    default:
      action = req.method;
  }

  // Extraire le nom de l'entité depuis l'URL
  const urlParts = req.url.split('/');
  let entite = 'inconnu';
  for (let i = urlParts.length - 1; i >= 0; i--) {
    const part = urlParts[i];
    if (part && !isMongoId(part) && isNaN(Number(part))) {
      entite = part.toLowerCase();
      break;
    }
  }

  const nouvelleValeur = req.body;
  const authHeaders: any = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Pour UPDATE et DELETE, récupérer l'ancienne valeur avant l'opération
  if (action === 'UPDATE' || action === 'DELETE') {
    return fetchAncienneValeur(http, req, authHeaders).pipe(
      switchMap((ancienneValeur: any) => {
        return next(req).pipe(
          tap(() => {
            envoyerLog(logService, {
              utilisateurId,
              action,
              entite,
              entiteId: extractEntityIdFromRequest(req),
              ancienneValeur: ancienneValeur || null,
              nouvelleValeur: action === 'DELETE' ? null : nouvelleValeur
            });
          }),
          catchError(error => {
            envoyerLog(logService, {
              utilisateurId,
              action,
              entite,
              entiteId: extractEntityIdFromRequest(req),
              ancienneValeur: ancienneValeur || null,
              nouvelleValeur: action === 'DELETE' ? null : nouvelleValeur
            });
            return of(error);
          })
        );
      })
    );
  }

  // Pour CREATE, pas d'ancienne valeur
  return next(req).pipe(
    tap(() => {
      envoyerLog(logService, {
        utilisateurId,
        action,
        entite,
        entiteId: extractEntityIdFromRequest(req),
        ancienneValeur: null,
        nouvelleValeur
      });
    }),
    catchError(error => {
      envoyerLog(logService, {
        utilisateurId,
        action,
        entite,
        entiteId: extractEntityIdFromRequest(req),
        ancienneValeur: null,
        nouvelleValeur
      });
      return of(error);
    })
  );
};

function envoyerLog(logService: LogService, logData: any): void {
  logService.logActivity(logData).subscribe({
    next: () => {},
    error: (err: any) => {
      console.debug('Erreur lors du log:', err?.message || 'Endpoint non disponible');
    }
  });
}

// Vérifier si une chaîne est un ObjectId MongoDB (24 caractères hexadécimaux)
function isMongoId(str: string): boolean {
  return /^[a-f\d]{24}$/i.test(str);
}

// Extraire l'ID de l'entité depuis l'URL
function extractEntityIdFromRequest(request: any): string | undefined {
  const urlParts = request.url.split('/');
  const lastPart = urlParts[urlParts.length - 1];

  // Vérifier si c'est un ObjectId MongoDB
  if (isMongoId(lastPart)) return lastPart;

  // Vérifier si c'est un ID numérique
  if (!isNaN(Number(lastPart)) && lastPart !== '') return lastPart;

  // Vérifier l'avant-dernier segment
  if (urlParts.length >= 2) {
    const secondLastPart = urlParts[urlParts.length - 2];
    if (isMongoId(secondLastPart)) return secondLastPart;
    if (!isNaN(Number(secondLastPart)) && secondLastPart !== '') return secondLastPart;
  }

  return undefined;
}

// Fonction pour vérifier si le token JWT est expiré
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Considérer comme expiré en cas d'erreur
  }
}