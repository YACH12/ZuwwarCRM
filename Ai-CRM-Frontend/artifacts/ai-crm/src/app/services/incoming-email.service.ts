import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, PageResponse } from './contact.service';

export interface IncomingEmail {
  id: number;
  clientId?: number | null;
  contact?: Contact | null;
  expediteur: string;
  sujet?: string;
  corps: string;
  categorie?: string | null;
  confianceCategorie?: number | null;
  receptionAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncomingEmailService {

  private apiUrl = '/incoming-emails';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<PageResponse<IncomingEmail>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'receptionAt,desc');
    return this.http.get<PageResponse<IncomingEmail>>(this.apiUrl, { params });
  }

  getByContact(contactId: number): Observable<IncomingEmail[]> {
    return this.http.get<IncomingEmail[]>(`${this.apiUrl}/contact/${contactId}`);
  }

  assignContact(emailId: number, contactId: number): Observable<IncomingEmail> {
    return this.http.patch<IncomingEmail>(`${this.apiUrl}/${emailId}/contact/${contactId}`, {});
  }
}
