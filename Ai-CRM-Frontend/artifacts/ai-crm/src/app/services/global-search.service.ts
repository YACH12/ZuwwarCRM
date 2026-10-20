import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchContactResult {
  id: number;
  nom: string;
  email: string;
}

export interface SearchDealResult {
  id: number;
  titre: string;
  montant: number;
  stage: string;
}

export interface SearchEntrepriseResult {
  id: number;
  nom: string;
  secteur?: string;
}

export interface GlobalSearchResults {
  contacts: SearchContactResult[];
  deals: SearchDealResult[];
  entreprises: SearchEntrepriseResult[];
}

// Nombre de résultats par catégorie affichés dans le menu déroulant de la navbar
const LIMIT_PAR_CATEGORIE = 5;

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private http = inject(HttpClient);
  // ⚠️ Hypothèse : base API sous environment.apiUrl et endpoints /contacts,
  // /deals, /entreprises acceptant un paramètre "search". Ajuster si les
  // noms de paramètres ou les chemins diffèrent dans le backend réel.
  private baseUrl = environment.apiUrl;

  search(query: string): Observable<GlobalSearchResults> {
    const params = { search: query, page: 0, size: LIMIT_PAR_CATEGORIE };

    const contacts$ = this.http.get<any>(`${this.baseUrl}/contacts`, { params }).pipe(
      map(res => (res.content ?? res ?? []).map((c: any) => ({
        id: c.id,
        nom: `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(),
        email: c.email,
      })))
    );

    const deals$ = this.http.get<any>(`${this.baseUrl}/deals`, { params }).pipe(
      map(res => (res.content ?? res ?? []).map((d: any) => ({
        id: d.id,
        titre: d.titre,
        montant: d.montant,
        stage: d.stage,
      })))
    );

    const entreprises$ = this.http.get<any>(`${this.baseUrl}/entreprises`, { params }).pipe(
      map(res => (res.content ?? res ?? []).map((e: any) => ({
        id: e.id,
        nom: e.nom,
        secteur: e.secteur,
      })))
    );

    return forkJoin({ contacts: contacts$, deals: deals$, entreprises: entreprises$ });
  }
}