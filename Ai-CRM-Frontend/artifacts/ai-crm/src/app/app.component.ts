import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    
    
    <!-- Tes routes -->
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';

  constructor(
    private keycloak: KeycloakService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.keycloak.isLoggedIn();
    
    if (this.isLoggedIn) {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.username || profile.email || '';
    }
  }

  logout() {
    this.keycloak.logout();
  }
}