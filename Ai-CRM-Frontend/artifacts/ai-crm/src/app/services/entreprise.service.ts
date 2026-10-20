import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Entreprise {
  id?: number;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  secteur?: string;
  siteWeb?: string;
  taille?: 'STARTUP' | 'PME' | 'ETI' | 'GRANDE';
}

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  private apiUrl = '/entreprises';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/${id}`);
  }

  create(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  update(id: number, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}