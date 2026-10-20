import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);

  // Ne pas intercepter les requêtes vers Keycloak
  if (req.url.includes(environment.keycloak.url)) {
    return next(req);
  }

  if (!keycloak.isLoggedIn()) {
    return next(req);
  }

  // updateToken(30) : rafraîchit le token s'il expire dans moins de 30s
  return from(keycloak.updateToken(30)).pipe(
    switchMap(() => from(keycloak.getToken())),
    switchMap(token => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(authReq);
    }),
    catchError((err) => {
      // Une erreur métier renvoyée par l'API (404, 500, etc.) ne doit pas
      // forcer une reconnexion — seul un échec de rafraîchissement du token
      // (updateToken/getToken) justifie une redirection vers login().
      if (err instanceof HttpErrorResponse) {
        return throwError(() => err);
      }
      keycloak.login();
      return throwError(() => err);
    })
  );
};