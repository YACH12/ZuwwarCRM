import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientRegister {
  nom:           string;
  prenom:        string;
  email:         string;
  telephone:     string;
  nomEntreprise: string;
  pays:          string;
  occupation?:   string;
  visitorId?:    string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = '';

  constructor(private http: HttpClient) {}

  inscrire(client: ClientRegister, planId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/clients/register?planId=${planId}`,
      client
    );
  }

  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/plans`);
  }
}