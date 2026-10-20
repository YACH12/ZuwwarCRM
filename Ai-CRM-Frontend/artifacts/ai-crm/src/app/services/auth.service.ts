import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloak: KeycloakService) {}

  // Récupérer le token
  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  // Récupérer l'utilisateur connecté
  getUser() {
    return this.keycloak.getKeycloakInstance().tokenParsed;
  }

  // Récupérer les rôles
  getRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  // Vérifier un rôle
  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  // Déconnexion
  logout() {
    this.keycloak.logout(environment.appUrl);
  }
}