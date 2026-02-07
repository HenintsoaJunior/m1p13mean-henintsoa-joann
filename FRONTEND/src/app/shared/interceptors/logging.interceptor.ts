import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const logService = inject(LogService);

  // Don't log GET requests (display operations) or logging requests themselves
  if (req.method === 'GET' || req.url.includes('/logs')) {
    return next(req);
  }

  // Extract user info
  const token = authService.getToken();
  let userId = '0'; // Using string '0' as default
  
  if (token) {
    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Try different possible field names for user ID
      userId = payload.userId || payload.user_id || payload.sub || payload.id || '0';
    } catch (e: any) {
      console.warn('Could not decode token to get user ID:', e);
    }
  }

  // Determine the action type based on HTTP method
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

  // Extract entity name from URL by looking for common API patterns
  const urlParts = req.url.split('/');
  // Look for the entity name in the URL (typically the part before the ID or at the end)
  let entity = 'unknown';
  for (let i = urlParts.length - 1; i >= 0; i--) {
    const part = urlParts[i];
    // Skip empty parts and numeric IDs
    if (part && isNaN(Number(part))) {
      entity = part.toLowerCase();
      break;
    }
  }

  // Store the request body for logging
  const newValue = req.body;

  return next(req).pipe(
    tap(response => {
      // Log the successful operation
      const logData = {
        userId: userId,
        action: action,
        entity: entity,
        entityId: extractEntityIdFromRequest(req),
        newValue: newValue,
        oldValue: action === 'UPDATE' ? extractOldValue(req) : undefined
      };

      // Log asynchronously without blocking the response
      logService.logActivity(logData).subscribe({
        next: () => {
          // Successfully logged
        },
        error: (err: any) => {
          // Error is already handled in the service with catchError, so we just log a debug message
          console.debug('Log activity request completed with warning:', err?.message || 'Logging endpoint not available');
        }
      });
    }),
    catchError(error => {
      // Even if the original request failed, we still want to log the attempt
      const logData = {
        userId: userId,
        action: action,
        entity: entity,
        entityId: extractEntityIdFromRequest(req),
        newValue: newValue,
        oldValue: action === 'UPDATE' ? extractOldValue(req) : undefined
      };

      logService.logActivity(logData).subscribe({
        next: () => {
          // Successfully logged
        },
        error: (err: any) => {
          // Error is already handled in the service with catchError, so we just log a debug message
          console.debug('Log activity request completed with warning for failed request:', err?.message || 'Logging endpoint not available');
        }
      });

      return of(error);
    })
  );
};

// Helper function to extract entity ID from request URL
function extractEntityIdFromRequest(request: any): number | undefined {
  const urlParts = request.url.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = parseInt(lastPart);
  if (!isNaN(id)) return id;
  
  // Check if the second to last part is an ID
  if (urlParts.length >= 2) {
    const secondLastPart = urlParts[urlParts.length - 2];
    const secondLastId = parseInt(secondLastPart);
    if (!isNaN(secondLastId)) return secondLastId;
  }
  
  return undefined;
}

// Helper function to extract old values (would need to be implemented based on your specific needs)
function extractOldValue(request: any): any {
  // For now, returning a placeholder
  // In a real implementation, you might want to store the previous state before an update
  return undefined;
}