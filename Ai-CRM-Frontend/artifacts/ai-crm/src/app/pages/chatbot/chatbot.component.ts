import { Component, ElementRef, Input, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { KeycloakService } from 'keycloak-angular';
import { LanguageService } from '../../services/language.service';
import { chatbotTranslations } from '../../shared/i18n/chatbot.i18n';

const POSITION_STORAGE_KEY = 'zuwwar-chatbot-position';
const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 540;
const SCREEN_MARGIN = 12;

interface Position { top: number; left: number; }

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {

  @Input() showFab = true;

  private langSvc = inject(LanguageService);
  t = this.langSvc.select(chatbotTranslations);

  private chatWindow = viewChild<ElementRef<HTMLElement>>('chatWindow');

  constructor(
    private chatService: ChatService,
    private keycloak: KeycloakService
  ) {}

  isOpen   = signal(false);
  messages = signal<ChatMessage[]>([
    { role: 'assistant', content: this.t().welcomeMessage }
  ]);
  inputMessage = '';
  loading = signal(false);

  // ── Fenêtre déplaçable ───────────────────────────────────────────────────
  position = signal<Position>(this.chargerPosition());
  private dragging = false;
  private dragOffset = { x: 0, y: 0 };

  private chargerPosition(): Position {
    try {
      const brut = localStorage.getItem(POSITION_STORAGE_KEY);
      if (brut) return JSON.parse(brut);
    } catch { /* position par défaut si stockage indisponible/corrompu */ }
    return this.positionParDefaut();
  }

  private positionParDefaut(): Position {
    return {
      top: window.innerHeight - WINDOW_HEIGHT - SCREEN_MARGIN,
      left: window.innerWidth - WINDOW_WIDTH - SCREEN_MARGIN,
    };
  }

  demarrerDeplacement(event: PointerEvent) {
    // Ignore les clics sur le bouton de fermeture éventuel dans l'en-tête
    if ((event.target as HTMLElement).closest('button')) return;

    const rect = this.chatWindow()?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    this.dragging = true;
    this.dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    const onMove = (e: PointerEvent) => this.deplacer(e);
    const onUp = () => {
      this.dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      try {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(this.position()));
      } catch { /* pas grave si le stockage échoue, position gardée en mémoire */ }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  private deplacer(event: PointerEvent) {
    if (!this.dragging) return;

    const left = this.clamp(event.clientX - this.dragOffset.x, 0, window.innerWidth - WINDOW_WIDTH);
    const top = this.clamp(event.clientY - this.dragOffset.y, 0, window.innerHeight - WINDOW_HEIGHT);
    this.position.set({ top, left });
  }

  private clamp(valeur: number, min: number, max: number): number {
    return Math.min(Math.max(valeur, min), Math.max(min, max));
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  useExemple(texte: string) {
    this.inputMessage = texte;
    this.envoyer();
  }

  async envoyer() {
    const texte = this.inputMessage.trim();
    if (!texte || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', content: texte }]);
    this.inputMessage = '';
    this.loading.set(true);

    const token = await this.keycloak.getToken();
    console.log('TOKEN:', token); // ← DEBUG TEMPORAIRE : à retirer après diagnostic
    const roles = this.keycloak.getUserRoles();
    const role = roles.includes('ADMIN') ? 'ADMIN' : roles.includes('MANAGER') ? 'MANAGER' : 'CLIENT';

    this.chatService.envoyerMessage(texte, token, role, this.messages()).subscribe({
      next: (res) => {
        this.messages.update(m => [...m, { role: 'assistant', content: res.reponse }]);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, {
          role: 'assistant',
          content: this.t().errorMessage
        }]);
        this.loading.set(false);
      }
    });
  }
}