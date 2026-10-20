import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Deal {
  id?: number;
  titre: string;
  montant: number;
  devise?: string;
  stage: 'PROSPECT' | 'QUALIFICATION' | 'PROPOSITION' | 'NEGOCIATION' | 'GAGNE' | 'PERDU';
  probabilite?: number;
  contact?: { id: number; nom?: string; prenom?: string };
  entreprise?: { id: number; nom?: string };
  dateClotureEstimee?: string;
  notes?: string;
  scoreIA?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DealService {

  private apiUrl = '/deals';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}?size=1000`);
  }

  getByStage(stage: string): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${this.apiUrl}/stage/${stage}`);
  }

  create(deal: Deal): Observable<Deal> {
    return this.http.post<Deal>(this.apiUrl, deal);
  }

  update(id: number, deal: Deal): Observable<Deal> {
    return this.http.put<Deal>(`${this.apiUrl}/${id}`, deal);
  }

  changerStage(id: number, stage: string): Observable<Deal> {
    return this.http.put<Deal>(`${this.apiUrl}/${id}/stage?stage=${stage}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}