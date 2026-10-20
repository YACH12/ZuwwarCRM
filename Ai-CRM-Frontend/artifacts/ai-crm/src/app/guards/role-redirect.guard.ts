import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Route d'accueil de /app : redirige vers la première page pertinente
 * selon le rôle, au lieu de toujours pointer vers /dashboard (inaccessible
 * à INTEGRATEUR, qui se retrouverait bloqué une fois AuthGuard appliqué
 * sur chaque route enfant).
 */
export const roleHomeRedirectGuard: CanActivateFn = () => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);
  const roles = keycloak.getUserRoles();

  const target =
    roles.includes('ADMIN') || roles.includes('MANAGER') || roles.includes('CLIENT')
      ? '/app/dashboard'
      : roles.includes('INTEGRATEUR')
        ? '/app/campaigns'
        : '/app/dashboard';

  router.navigateByUrl(target);
  return false;
};
