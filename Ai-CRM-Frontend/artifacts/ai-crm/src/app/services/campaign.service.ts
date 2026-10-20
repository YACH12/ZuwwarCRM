import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Campaign {
  id?: number;
  name: string;
  subject: string;
  type?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  htmlContent: string;
  statut?: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';
  scheduledAt?: string;
  sentAt?: string;
  totalSent?: number;
  totalBounced?: number;
  totalClicks?: number;
  totalOpened?: number;
  openRate?: number;
  clickRate?: number;
  template?: { id: number; nom?: string };
  contacts?: any[];
  creatAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  // Utilisation de environment.apiUrl pour pointer vers le port 8081
  private apiUrl = `${environment.apiUrl}/campaigns`;
  private templateApiUrl = `${environment.apiUrl}/templates`;

  constructor(private http: HttpClient) {}

  createTemplate(template: any): Observable<any> {
    return this.http.post<any>(this.templateApiUrl, template);
  }

  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(this.templateApiUrl);
  }

  updateTemplate(id: number, template: any): Observable<any> {
    return this.http.put<any>(`${this.templateApiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.templateApiUrl}/${id}`);
  }

  getAll(page = 0, size = 10): Observable<PageResponse<Campaign>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Campaign>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

  create(campaign: Campaign): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, campaign);
  }

  update(id: number, campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${id}`, campaign);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  send(id: number): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${id}/send`, {});
  }

  addContacts(id: number, contactIds: number[]): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.apiUrl}/${id}/contacts`, contactIds);
  }
}