import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {

  constructor(
    protected override router: Router,
    protected keycloakService: KeycloakService
  ) {
    super(router, keycloakService);
  }

  async isAccessAllowed(route: ActivatedRouteSnapshot): Promise<boolean> {

    if (!this.authenticated) {
      await this.keycloakService.login();
      return false;
    }

    const roles = route.data['roles'];

    if (!roles || roles.length === 0) {
      return true;
    }

    return roles.some((role: string) => this.roles.includes(role));
  }
}