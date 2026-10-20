import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Activite {
  id?: number;
  type: 'TACHE' | 'NOTE' | 'SYSTEME';
  titre: string;
  description?: string;
  statut?: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE';
  contact?: { id: number; nom?: string; prenom?: string };
  deal?: { id: number; titre?: string };
  creePar?: string;
  roleCreateur?: string;
  dateEcheance?: string;
  dateCreation?: string;
}

@Injectable({ providedIn: 'root' })
export class ActiviteService {

  private apiUrl = '/activites';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getByContact(contactId: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/contact/${contactId}`);
  }

  getByDeal(dealId: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/deal/${dealId}`);
  }

  getTachesAFaire(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/taches/a-faire`);
  }

  creer(activite: any): Observable<Activite> {
    return this.http.post<Activite>(this.apiUrl, activite);
  }

  changerStatut(id: number, statut: string): Observable<Activite> {
    return this.http.put<Activite>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}