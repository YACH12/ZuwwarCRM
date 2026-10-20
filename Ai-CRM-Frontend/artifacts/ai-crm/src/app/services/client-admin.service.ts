import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanTier {
  id: number;
  code: string;
  nom: string;
  prix: number;
}

export interface ClientDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  nomEntreprise?: string;
  secteur?: string;
  pays?: string;
  planTier?: PlanTier;
  statut: string;
  emailsEnvoyes: number;
  contactsUtilises: number;
  usersActifs: number;
  scoreIA: number;
  source?: string;
  emailVerifie: boolean;
  dateInscription?: string;
  dateExpiration?: string;
  dateActivation?: string;
  createdAt?: string;
  photoUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ClientStats {
  total: number;
  actifs: number;
  prospects: number;
  suspendus: number;
  expires: number;
}

@Injectable({ providedIn: 'root' })
export class ClientAdminService {
  private base = '/clients';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50): Observable<PageResponse<ClientDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ClientDTO>>(this.base, { params });
  }

  getStats(): Observable<ClientStats> {
    return this.http.get<ClientStats>(`${this.base}/stats`);
  }

  suspendre(id: number): Observable<any> {
    return this.http.put(`${this.base}/${id}/suspendre`, {});
  }

  reactiver(id: number): Observable<any> {
    return this.http.put(`${this.base}/${id}/reactiver`, {});
  }

  changerPlan(id: number, planId: string): Observable<any> {
    const params = new HttpParams().set('planId', planId);
    return this.http.put(`${this.base}/${id}/plan`, {}, { params });
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updatePhoto(id: number, photoUrl: string): Observable<ClientDTO> {
    return this.http.put<ClientDTO>(`${this.base}/${id}/photo`, { photoUrl });
  }

  recalculateScore(id: number): Observable<{ clientId: number; scoreIA: number }> {
    return this.http.post<{ clientId: number; scoreIA: number }>(
      `${this.base}/${id}/score/recalculate`, {}
    );
  }

  updateAllScores(): Observable<{ success: number; errors: number; message: string }> {
    return this.http.post<{ success: number; errors: number; message: string }>(
      `${this.base}/update-all-scores`, {}
    );
  }
}
