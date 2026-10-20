import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../services/contact.service';
import { ActiviteService } from '../../services/activite.service';
import { LanguageService } from '../../services/language.service';
import { contactProfileTranslations } from '../i18n/contact-profile.i18n';

@Component({
  selector: 'app-contact-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; backdrop-filter: blur(2px);
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

    .modal {
      background: #FFFFFF; border-radius: 16px; width: 520px; max-width: calc(100vw - 32px);
      max-height: 85vh; overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,.18);
      border: 1px solid #E5E7EB;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(16px); opacity:0 }
      to   { transform: translateY(0);    opacity:1 }
    }

    /* Header */
    .modal-header {
      padding: 24px 24px 20px; border-bottom: 1px solid #F3F4F6;
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    }
    .contact-hero { display: flex; align-items: center; gap: 16px; }
    .avatar-xl {
      width: 56px; height: 56px; border-radius: 50%;
      background: #111827; color: #FFFFFF;
      font-size: 20px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .contact-main-info h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .contact-main-info p  { font-size: 13px; color: #6B7280; margin: 0; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px; margin-top: 6px;
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-ABONNE    { background: #D1FAE5; color: #065F46; }
    .status-ABONNE    .status-dot { background: #10B981; }
    .status-DESABONNE { background: #FEF3C7; color: #92400E; }
    .status-DESABONNE .status-dot { background: #F59E0B; }
    .status-BOUNCED   { background: #FEE2E2; color: #991B1B; }
    .status-BOUNCED   .status-dot { background: #EF4444; }

    .close-btn {
      background: none; border: none; color: #9CA3AF; cursor: pointer;
      padding: 6px; border-radius: 8px; font-size: 20px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .close-btn:hover { background: #F3F4F6; color: #111827; }

    /* Quick actions */
    .quick-actions {
      display: flex; gap: 8px; padding: 16px 24px;
      border-bottom: 1px solid #F3F4F6;
    }
    .action-btn {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF;
      font-size: 13px; font-weight: 500; color: #374151;
      cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
      text-decoration: none;
    }
    .action-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }
    .action-btn.active { background: #F3F4F6; border-color: #111827; color: #111827; }

    /* Mini formulaire Planifier */
    .planifier-form {
      margin: 0 24px 0; padding: 16px; background: #F9FAFB;
      border: 1px solid #E5E7EB; border-radius: 10px;
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { opacity:0; transform: translateY(-6px) }
      to   { opacity:1; transform: translateY(0) }
    }
    .planifier-form h4 {
      font-size: 13px; font-weight: 600; color: #111827;
      margin: 0 0 12px;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .form-field label { font-size: 11px; font-weight: 600; color: #6B7280; }
    .form-field input,
    .form-field select,
    .form-field textarea {
      padding: 8px 10px; border: 1px solid #E5E7EB; border-radius: 6px;
      font-size: 13px; font-family: 'Inter', sans-serif; color: #111827;
      background: #FFFFFF; outline: none; transition: border-color 0.15s;
    }
    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus { border-color: #111827; }
    .form-field textarea { resize: vertical; min-height: 60px; }
    .form-field.full { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .btn-sm {
      padding: 7px 14px; border-radius: 7px; font-size: 12px;
      font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;
      border: none; transition: all 0.15s;
    }
    .btn-sm-primary { background: #111827; color: #FFFFFF; }
    .btn-sm-primary:hover { background: #1F2937; }
    .btn-sm-secondary { background: #FFFFFF; border: 1px solid #E5E7EB; color: #374151; }
    .btn-sm-secondary:hover { background: #F3F4F6; }

    /* Success toast */
    .toast {
      display: flex; align-items: center; gap: 8px;
      margin: 0 24px 16px; padding: 10px 14px;
      background: #D1FAE5; border: 1px solid #A7F3D0;
      border-radius: 8px; font-size: 13px; color: #065F46; font-weight: 500;
      animation: fadeIn 0.2s ease;
    }

    .planifier-error {
      margin-top: 10px; padding: 8px 12px;
      background: #FEE2E2; border: 1px solid #FCA5A5;
      border-radius: 8px; font-size: 12.5px; color: #991B1B; font-weight: 500;
    }

    /* Body */
    .modal-body { padding: 20px 24px; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 11px; font-weight: 600; color: #9CA3AF;
      text-transform: uppercase; letter-spacing: .05em; margin-bottom: 12px;
    }

    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item {
      background: #F9FAFB; border: 1px solid #F3F4F6;
      border-radius: 8px; padding: 12px 14px;
    }
    .info-label { font-size: 11px; color: #9CA3AF; font-weight: 500; margin-bottom: 4px; }
    .info-value { font-size: 13px; font-weight: 600; color: #111827; }
    .info-value a { color: #111827; text-decoration: none; }
    .info-value a:hover { text-decoration: underline; }

    /* Score IA */
    .score-bar {
      height: 6px; background: #E5E7EB; border-radius: 3px;
      overflow: hidden; margin-top: 4px;
    }
    .score-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }

    /* Badges */
    .lead-badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; border: 1px solid;
    }
    .lead-New         { background: #DBEAFE; color: #1E40AF; border-color: #BFDBFE; }
    .lead-Engaged     { background: #EDE9FE; color: #5B21B6; border-color: #DDD6FE; }
    .lead-High_Intent { background: #D1FAE5; color: #065F46; border-color: #A7F3D0; }

    .source-badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
      background: #F3F4F6; color: #4B5563; border: 1px solid #E5E7EB;
    }

    /* Deals */
    .deal-list { display: flex; flex-direction: column; gap: 8px; }
    .deal-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; background: #F9FAFB;
      border: 1px solid #F3F4F6; border-radius: 8px; transition: background 0.15s;
    }
    .deal-item:hover { background: #F3F4F6; }
    .deal-item-left { display: flex; flex-direction: column; gap: 3px; }
    .deal-item-name   { font-size: 13px; font-weight: 600; color: #111827; }
    .deal-item-amount { font-size: 12px; color: #6B7280; }
    .deal-stage-badge {
      font-size: 11px; font-weight: 600; padding: 3px 10px;
      border-radius: 20px; border: 1px solid #E5E7EB;
    }
    .stage-GAGNE        { background: #D1FAE5; color: #065F46;  border-color: #A7F3D0; }
    .stage-NEGOCIATION  { background: #EDE9FE; color: #5B21B6;  border-color: #DDD6FE; }
    .stage-PROPOSITION  { background: #FEF3C7; color: #92400E;  border-color: #FDE68A; }
    .stage-QUALIFICATION{ background: #DBEAFE; color: #1E40AF;  border-color: #BFDBFE; }
    .stage-PROSPECT     { background: #F3F4F6; color: #4B5563;  border-color: #E5E7EB; }

    .loading-state, .empty-state {
      text-align: center; padding: 32px; color: #9CA3AF; font-size: 13px;
    }

    /* Footer */
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid #F3F4F6;
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .btn-primary {
      background: #111827; color: #FFFFFF; padding: 9px 18px;
      border-radius: 8px; font-size: 13px; font-weight: 600;
      border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s;
    }
    .btn-primary:hover { background: #1F2937; }
    .btn-secondary {
      background: #FFFFFF; border: 1px solid #E5E7EB; color: #374151;
      padding: 9px 18px; border-radius: 8px; font-size: 13px;
      font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif;
    }
    .btn-secondary:hover { background: #F9FAFB; }
  `],
  template: `
    <div class="overlay" (click)="onOverlayClick($event)" (keydown.escape)="close.emit()">
      <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="contact() ? contact()!.prenom + ' ' + contact()!.nom : t().loading" (click)="$event.stopPropagation()">

        @if (loading()) {
          <div class="loading-state">{{ t().loading }}</div>
        }

        @if (!loading() && contact()) {

          <!-- ── Header ── -->
          <div class="modal-header">
            <div class="contact-hero">
              <div class="avatar-xl">{{ initials() }}</div>
              <div class="contact-main-info">
                <h2>{{ contact()!.prenom }} {{ contact()!.nom }}</h2>
                <p>{{ contact()!.email }}</p>
                <span class="status-badge" [class]="'status-' + contact()!.status">
                  <span class="status-dot"></span>
                  {{ contact()!.status }}
                </span>
              </div>
            </div>
            <button class="close-btn" [attr.aria-label]="t().footer.close" (click)="close.emit()">×</button>
          </div>

          <!-- ── Quick actions ── -->
          <div class="quick-actions">

            <!-- Email -->
            <a class="action-btn"
               [href]="'mailto:' + contact()!.email"
               target="_blank">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {{ t().quickActions.sendEmail }}
            </a>

            <!-- Appeler -->
            <a class="action-btn"
               [href]="'tel:' + contact()!.telephone">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {{ t().quickActions.call }}
            </a>

            <!-- Planifier -->
            <button class="action-btn" [class.active]="showPlanifier()"
                    (click)="togglePlanifier()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ t().quickActions.schedule }}
            </button>

          </div>

          <!-- ── Toast succès ── -->
          @if (planifierSuccess()) {
            <div class="toast">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ t().toast.scheduledSuccess }}
            </div>
          }

          <!-- ── Mini formulaire Planifier ── -->
          @if (showPlanifier()) {
            <div class="planifier-form">
              <h4>{{ t().planifierForm.title }}</h4>

              <div class="form-row">
                <div class="form-field">
                  <label>{{ t().planifierForm.type }}</label>
                  <select [(ngModel)]="planifierData.type">
                    <option value="APPEL">{{ t().planifierForm.typeOptions.appel }}</option>
                    <option value="REUNION">{{ t().planifierForm.typeOptions.reunion }}</option>
                    <option value="EMAIL">{{ t().planifierForm.typeOptions.email }}</option>
                    <option value="TACHE">{{ t().planifierForm.typeOptions.tache }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>{{ t().planifierForm.dateTime }}</label>
                  <input type="datetime-local" [(ngModel)]="planifierData.date"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full">
                  <label>{{ t().planifierForm.titre }}</label>
                  <input type="text" [(ngModel)]="planifierData.titre"
                         [placeholder]="t().planifierForm.titrePlaceholder"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full">
                  <label>{{ t().planifierForm.notes }}</label>
                  <textarea [(ngModel)]="planifierData.notes"
                            [placeholder]="t().planifierForm.notesPlaceholder"></textarea>
                </div>
              </div>

              @if (planifierError()) {
                <div class="planifier-error">{{ planifierError() }}</div>
              }

              <div class="form-actions">
                <button class="btn-sm btn-sm-secondary" (click)="togglePlanifier()">
                  {{ t().planifierForm.cancel }}
                </button>
                <button class="btn-sm btn-sm-primary"
                        [disabled]="!planifierData.titre || planifierSaving()"
                        (click)="savePlanifier()">
                  {{ t().planifierForm.save }}
                </button>
              </div>
            </div>
          }

          <!-- ── Body ── -->
          <div class="modal-body">

            <!-- Informations -->
            <div class="section">
              <div class="section-title">{{ t().sections.informations }}</div>
              <div class="info-grid">

                <div class="info-item">
                  <div class="info-label">{{ t().fields.prenom }}</div>
                  <div class="info-value">{{ contact()!.prenom || '—' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.nom }}</div>
                  <div class="info-value">{{ contact()!.nom || '—' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.email }}</div>
                  <div class="info-value">
                    <a [href]="'mailto:' + contact()!.email">{{ contact()!.email || '—' }}</a>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.telephone }}</div>
                  <div class="info-value">{{ contact()!.telephone || '—' }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.source }}</div>
                  <div class="info-value">
                    <span class="source-badge">{{ contact()!.source }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.leadStage }}</div>
                  <div class="info-value">
                    <span class="lead-badge" [class]="'lead-' + contact()!.leadStage">
                      {{ contact()!.leadStage }}
                    </span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.createdAt }}</div>
                  <div class="info-value">
                    {{ contact()!.createdAt ? (contact()!.createdAt | date:'dd MMM yyyy') : '—' }}
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">{{ t().fields.engagementScore }}</div>
                  <div class="info-value">
                    {{ contact()!.scoreEngagement }} / 100
                    <div class="score-bar">
                      <div class="score-fill"
                        [style.width.%]="contact()!.scoreEngagement"
                        [style.background]="scoreColor(contact()!.scoreEngagement)">
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Deals liés -->
            <div class="section">
              <div class="section-title">{{ t().sections.dealsLinked }} ({{ deals().length }})</div>

              @if (deals().length === 0) {
                <div class="empty-state">{{ t().emptyDeals }}</div>
              }

              <div class="deal-list">
                @for (deal of deals(); track deal.id) {
                  <div class="deal-item">
                    <div class="deal-item-left">
                      <span class="deal-item-name">{{ deal.titre }}</span>
                      <span class="deal-item-amount">{{ formatMontant(deal.montant) }}</span>
                    </div>
                    <span class="deal-stage-badge" [class]="'stage-' + deal.stage">
                      {{ stageLabel(deal.stage) }}
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- ── Footer ── -->
          <div class="modal-footer">
            <button class="btn-secondary" (click)="close.emit()">{{ t().footer.close }}</button>
            <button class="btn-primary" (click)="goToContact()">
              {{ t().footer.viewFullProfile }}
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class ContactProfileModalComponent implements OnInit {
  @Input() contactId!: number;
  @Input() allDeals: any[] = [];

  @Output() close    = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<number>();

  private langSvc = inject(LanguageService);
  t = this.langSvc.select(contactProfileTranslations);

  contact         = signal<Contact | null>(null);
  loading         = signal(true);
  deals           = signal<any[]>([]);
  showPlanifier   = signal(false);
  planifierSuccess = signal(false);
  planifierSaving  = signal(false);
  planifierError   = signal('');

  planifierData = {
    type:  'APPEL',
    date:  '',
    titre: '',
    notes: ''
  };

  constructor(
    private contactService: ContactService,
    private activiteService: ActiviteService
  ) {}

  ngOnInit() {
    // Pré-remplir la date avec maintenant + 1h
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    this.planifierData.date = now.toISOString().slice(0, 16);

    this.contactService.getById(this.contactId).subscribe({
      next: (c) => {
        this.contact.set(c);
        this.deals.set(this.allDeals.filter(d => d.contact?.id === this.contactId));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  togglePlanifier() {
    this.showPlanifier.update(v => !v);
    this.planifierSuccess.set(false);
  }

  savePlanifier() {
    if (!this.planifierData.titre) return;

    const typeLabels: Record<string, string> = {
      APPEL: this.t().planifierForm.typeOptions.appel,
      REUNION: this.t().planifierForm.typeOptions.reunion,
      EMAIL: this.t().planifierForm.typeOptions.email,
      TACHE: this.t().planifierForm.typeOptions.tache,
    };

    this.planifierSaving.set(true);
    this.planifierError.set('');

    this.activiteService.creer({
      type: 'TACHE',
      titre: `${typeLabels[this.planifierData.type] || ''} ${this.planifierData.titre}`.trim(),
      description: this.planifierData.notes,
      statut: 'A_FAIRE',
      priorite: 'NORMALE',
      dateEcheance: this.planifierData.date,
      contact: { id: this.contactId }
    }).subscribe({
      next: () => {
        this.planifierSaving.set(false);
        this.showPlanifier.set(false);
        this.planifierSuccess.set(true);
        this.planifierData = { type: 'APPEL', date: '', titre: '', notes: '' };
        setTimeout(() => this.planifierSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Erreur planification activité', err);
        this.planifierSaving.set(false);
        this.planifierError.set(this.t().toast.scheduledError);
      }
    });
  }

  initials(): string {
    const c = this.contact();
    if (!c) return '?';
    return ((c.prenom?.[0] || '') + (c.nom?.[0] || '')).toUpperCase();
  }

  scoreColor(score: number): string {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' MAD';
  }

  stageLabel(stage: string): string {
    const map = this.t().stageLabels as Record<string, string>;
    return map[stage] ?? stage;
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close.emit();
    }
  }

  goToContact() {
    this.navigate.emit(this.contactId);
  }
}