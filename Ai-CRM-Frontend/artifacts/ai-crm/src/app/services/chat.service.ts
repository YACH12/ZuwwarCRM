import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reponse: string;
  fonctions_utilisees: string[];
  sources_rag: any[];
  model: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private apiUrl = `${environment.aiServiceUrl}/rag/chat`;

  constructor(private http: HttpClient) {}

  envoyerMessage(
    message: string,
    token: string,
    role: string,
    historique: ChatMessage[]
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, {
      message,
      token,
      role,
      historique
    });
  }
}