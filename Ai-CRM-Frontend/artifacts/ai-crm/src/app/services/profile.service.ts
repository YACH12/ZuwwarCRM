import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Le backend renvoie UserResponseDTO (staff) ou ClientResponseDTO (tenant CLIENT)
// selon le compte connecté — ces champs sont les seuls communs aux deux formes.
// planTier n'est présent que pour un compte CLIENT (absent/undefined pour le staff,
// qui n'est jamais limité par un plan).
export interface ProfileResponse {
  id: number;
  photoUrl?: string;
  planTier?: {
    code: string;
    chatbotAccess: boolean;
    smtpPersonnalise: boolean;
    exportCSV: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = '/profile';

  constructor(private http: HttpClient) {}

  getMe(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/me`);
  }

  updateMyPhoto(photoUrl: string): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/me/photo`, { photoUrl });
  }
}
