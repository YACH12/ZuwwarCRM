import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SmtpConfig {
  id?: number;
  host: string;
  port: number;
  username: string;
  password: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class SmtpService {
  private apiUrl = '/smtps';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<PageResponse<SmtpConfig>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SmtpConfig>>(this.apiUrl, { params });
  }

  create(smtp: SmtpConfig): Observable<SmtpConfig> {
    return this.http.post<SmtpConfig>(this.apiUrl, smtp);
  }

  update(id: number, smtp: SmtpConfig): Observable<SmtpConfig> {
    return this.http.put<SmtpConfig>(`${this.apiUrl}/${id}`, smtp);
  }

  activate(id: number): Observable<SmtpConfig> {
    return this.http.patch<SmtpConfig>(`${this.apiUrl}/${id}/activate`, {});
  }

  testConnection(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/test`, {}
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
