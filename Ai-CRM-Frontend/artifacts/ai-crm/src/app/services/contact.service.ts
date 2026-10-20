import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  status: 'ABONNE' | 'DESABONNE' | 'BOUNCED';
  source: 'IMPORT' | 'MANUAL' | 'API';
  scoreEngagement: number;
  leadStage: 'New' | 'Engaged' | 'High_Intent';
  createdAt?: string;
  selected?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ScoreResult {
  contactId: number;
  scoreEngagement: number;
  leadStage: 'New' | 'Engaged' | 'High_Intent';
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = '/contacts';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<PageResponse<Contact>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Contact>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  create(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact);
  }

  update(id: number, contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${id}`, contact);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import-csv`, formData);
  }

  /** Recalcule le score d'engagement d'un contact depuis son historique de tracking */
  recalculateScore(id: number): Observable<ScoreResult> {
    return this.http.post<ScoreResult>(`${this.apiUrl}/${id}/score/recalculate`, {});
  }

  /** Recalcule tous les scores d'engagement */
  updateAllScores(): Observable<{ message: string; success: number; errors: number }> {
    return this.http.post<{ message: string; success: number; errors: number }>(
      `${this.apiUrl}/update-all-scores`, {}
    );
  }
}
