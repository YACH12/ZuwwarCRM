import { Component } from '@angular/core';

/**
 * Composant vide utilisé uniquement comme cible technique pour les routes
 * dont l'activation est entièrement décidée par un guard (ex: redirection
 * par rôle) — Angular exige qu'une route déclare component/loadComponent/
 * redirectTo/children, même quand le guard empêche toujours le rendu.
 */
@Component({
  selector: 'app-blank',
  standalone: true,
  template: '',
})
export class BlankComponent {}
