import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackendUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  enabled: boolean;
  creatAt?: string;
  IDkeyclock?: string;
  photoUrl?: string;
}

export interface UserCreateRequest {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  role: string;
  enabled: boolean;
}

export interface UserUpdateRequest {
  prenom: string;
  nom: string;
  email: string;
  role: string;
  enabled: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/users';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50): Observable<PageResponse<BackendUser>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<BackendUser>>(this.apiUrl, { params });
  }

  create(user: UserCreateRequest): Observable<BackendUser> {
    return this.http.post<BackendUser>(this.apiUrl, user);
  }

  update(id: number, user: UserUpdateRequest): Observable<BackendUser> {
    return this.http.put<BackendUser>(`${this.apiUrl}/${id}`, user);
  }

  updatePhoto(id: number, photoUrl: string): Observable<BackendUser> {
    return this.http.put<BackendUser>(`${this.apiUrl}/${id}/photo`, { photoUrl });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
