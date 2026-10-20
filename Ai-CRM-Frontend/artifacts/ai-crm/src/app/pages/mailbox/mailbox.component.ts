import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IncomingEmailService, IncomingEmail } from '../../services/incoming-email.service';
import { ContactService } from '../../services/contact.service';
import { LanguageService } from '../../services/language.service';
import { mailboxTranslations } from '../../shared/i18n/mailbox.i18n';

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  devis_info_produit: { bg: '#D1FAE5', color: '#065F46' },
  reclamation:        { bg: '#FEE2E2', color: '#991B1B' },
  support_technique:  { bg: '#DBEAFE', color: '#1E40AF' },
  suivi_commande:     { bg: '#FEF3C7', color: '#92400E' },
  spam_hors_sujet:    { bg: '#F3F4F6', color: '#4B5563' },
};

@Component({
  selector: 'app-mailbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-header { margin-bottom: 20px; }
    .page-title { font-size: 20px; font-weight: 700; color: var(--ink-900, #0F172A); margin: 0 0 4px; }
    .page-subtitle { font-size: 13px; color: var(--ink-500, #64748B); margin: 0; }

    .card {
      background: var(--surface, #FFFFFF); border: 1px solid var(--line, #E5E7EB);
      border-radius: 12px; overflow: hidden;
    }

    .table-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 640px; border-collapse: collapse; }
    thead th {
      text-align: left; font-size: 11px; font-weight: 600; color: var(--ink-400, #94A3B8);
      text-transform: uppercase; letter-spacing: 0.04em;
      padding: 12px 16px; border-bottom: 1px solid var(--line, #E5E7EB);
      background: var(--canvas, #F8FAFC);
    }
    tbody td {
      padding: 12px 16px; font-size: 13px; color: var(--ink-900, #0F172A);
      border-bottom: 1px solid var(--line-soft, #F1F5F9); vertical-align: middle;
    }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr { cursor: pointer; }
    tbody tr:hover { background: var(--canvas, #F8FAFC); }
    tbody tr:focus-visible { outline: 2px solid var(--accent, #7C3AED); outline-offset: -2px; }

    .detail-body {
      white-space: pre-wrap; word-break: break-word; font-size: 13px; color: #111827;
      max-height: 320px; overflow-y: auto; background: #F9FAFB; border: 1px solid #F3F4F6;
      border-radius: 8px; padding: 12px 14px; margin-top: 4px;
    }

    .expediteur { font-weight: 600; }
    .sujet { color: var(--ink-500, #64748B); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .badge {
      display: inline-flex; align-items: center; padding: 3px 10px;
      border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .badge-none { background: #F3F4F6; color: #6B7280; }

    .contact-link { font-weight: 600; color: var(--accent, #7C3AED); }

    .create-contact-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 10px; border-radius: 7px; border: 1px solid var(--line, #E5E7EB);
      background: var(--surface, #FFFFFF); color: var(--ink-700, #334155);
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .create-contact-btn:hover { background: var(--accent-soft, #EDE9FE); color: var(--accent, #7C3AED); border-color: var(--accent, #7C3AED); }

    .date-cell { color: var(--ink-500, #64748B); font-size: 12.5px; white-space: nowrap; }

    .loading-state, .empty-state {
      text-align: center; padding: 48px; color: var(--ink-400, #94A3B8); font-size: 13px;
    }

    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid var(--line, #E5E7EB);
      font-size: 12.5px; color: var(--ink-500, #64748B);
    }
    .page-btns { display: flex; gap: 6px; }
    .page-btn {
      width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--line, #E5E7EB);
      background: var(--surface, #FFFFFF); color: var(--ink-700, #334155); cursor: pointer;
      font-size: 12px; font-weight: 600; transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) { background: var(--canvas, #F8FAFC); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Modal */
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; backdrop-filter: blur(2px);
    }
    .modal {
      background: #FFFFFF; border-radius: 16px; width: 420px; max-width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,.18); border: 1px solid #E5E7EB;
      padding: 24px;
    }
    .modal h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 18px; }
    .form-field { margin-bottom: 12px; }
    .form-field label { display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 4px; }
    .form-field input {
      width: 100%; padding: 9px 12px; border: 1px solid #E5E7EB; border-radius: 8px;
      font-size: 13px; font-family: 'Inter', sans-serif; box-sizing: border-box;
    }
    .form-field input:disabled { background: #F3F4F6; color: #6B7280; }
    .form-error { font-size: 12px; color: #991B1B; margin-bottom: 10px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .btn-primary {
      background: #111827; color: #FFFFFF; padding: 9px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary {
      background: #FFFFFF; border: 1px solid #E5E7EB; color: #374151;
      padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
    }

    /* Toasts */
    .toast-stack { position: fixed; bottom: 20px; right: 20px; z-index: 3000; display: flex; flex-direction: column; gap: 8px; }
    .toast {
      min-width: 260px; max-width: 360px; padding: 12px 14px; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,.12); font-size: 13px;
    }
    .toast-success { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
    .toast-error   { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
    .toast-title { font-weight: 700; }
    .toast-sub { font-size: 12px; opacity: 0.85; margin-top: 2px; }
  `],
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ t().title }}</h1>
      <p class="page-subtitle">{{ t().subtitle }}</p>
    </div>

    <div class="card">
      @if (loading()) {
        <div class="loading-state">{{ t().loading }}</div>
      } @else if (emails().length === 0) {
        <div class="empty-state">{{ t().empty }}</div>
      } @else {
        <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ t().columns.expediteur }}</th>
              <th>{{ t().columns.sujet }}</th>
              <th>{{ t().columns.categorie }}</th>
              <th>{{ t().columns.contact }}</th>
              <th>{{ t().columns.date }}</th>
            </tr>
          </thead>
          <tbody>
            @for (email of emails(); track email.id) {
              <tr tabindex="0" role="button" [attr.aria-label]="email.expediteur + ' — ' + (email.sujet || t().noSubject)"
                  (click)="openDetail(email)" (keydown.enter)="openDetail(email)">
                <td class="expediteur">{{ email.expediteur }}</td>
                <td class="sujet" [title]="email.sujet || ''">{{ email.sujet || t().noSubject }}</td>
                <td>
                  @if (email.categorie) {
                    <span class="badge" [style.background]="categoryBg(email.categorie)" [style.color]="categoryColor(email.categorie)">
                      {{ categoryLabel(email.categorie) }}
                    </span>
                  } @else {
                    <span class="badge badge-none">{{ t().noCategory }}</span>
                  }
                </td>
                <td>
                  @if (email.contact) {
                    <span class="contact-link">{{ email.contact.prenom }} {{ email.contact.nom }}</span>
                  } @else {
                    <button class="create-contact-btn" (click)="openCreateContact(email); $event.stopPropagation()">
                      {{ t().createContactBtn }}
                    </button>
                  }
                </td>
                <td class="date-cell">{{ email.receptionAt | date:'dd MMM yyyy, HH:mm' }}</td>
              </tr>
            }
          </tbody>
        </table>
        </div>

        <div class="pagination-bar">
          <span>{{ withCounts(t().pagination) }}</span>
          <div class="page-btns">
            <button class="page-btn" [disabled]="currentPage() === 0" (click)="prevPage()">‹</button>
            <button class="page-btn" [disabled]="(currentPage() + 1) * pageSize >= totalElements()" (click)="nextPage()">›</button>
          </div>
        </div>
      }
    </div>

    @if (showCreateModal()) {
      <div class="overlay" (click)="closeCreateContact()" (keydown.escape)="closeCreateContact()">
        <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="t().createModal.title" (click)="$event.stopPropagation()">
          <h3>{{ t().createModal.title }}</h3>

          <div class="form-field">
            <label>{{ t().createModal.email }}</label>
            <input type="text" [value]="selectedEmail()?.expediteur" disabled />
          </div>
          <div class="form-field">
            <label>{{ t().createModal.nom }}</label>
            <input type="text" [(ngModel)]="newContact.nom" />
          </div>
          <div class="form-field">
            <label>{{ t().createModal.prenom }}</label>
            <input type="text" [(ngModel)]="newContact.prenom" />
          </div>
          <div class="form-field">
            <label>{{ t().createModal.telephone }}</label>
            <input type="text" [(ngModel)]="newContact.telephone" />
          </div>

          @if (createError()) {
            <div class="form-error">{{ createError() }}</div>
          }

          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeCreateContact()">{{ t().createModal.cancel }}</button>
            <button class="btn-primary" [disabled]="creating()" (click)="createContactAndLink()">
              {{ t().createModal.save }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showDetailModal()) {
      <div class="overlay" (click)="closeDetail()" (keydown.escape)="closeDetail()">
        <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="t().detailModal.title" (click)="$event.stopPropagation()">
          <h3>{{ t().detailModal.title }}</h3>

          <div class="form-field">
            <label>{{ t().detailModal.from }}</label>
            <input type="text" [value]="detailEmail()?.expediteur" disabled />
          </div>
          <div class="form-field">
            <label>{{ t().detailModal.subject }}</label>
            <input type="text" [value]="detailEmail()?.sujet || t().noSubject" disabled />
          </div>
          <div class="form-field">
            <label>{{ t().detailModal.receivedOn }}</label>
            <input type="text" [value]="detailEmail()?.receptionAt | date:'dd MMM yyyy, HH:mm'" disabled />
          </div>
          <div class="form-field">
            <label>{{ t().columns.categorie }}</label>
            <div>
              @if (detailEmail()?.categorie) {
                <span class="badge" [style.background]="categoryBg(detailEmail()!.categorie!)" [style.color]="categoryColor(detailEmail()!.categorie!)">
                  {{ categoryLabel(detailEmail()!.categorie!) }}
                </span>
              } @else {
                <span class="badge badge-none">{{ t().noCategory }}</span>
              }
            </div>
          </div>
          <div class="form-field">
            <label>{{ t().detailModal.message }}</label>
            <div class="detail-body">{{ detailEmail()?.corps }}</div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeDetail()">{{ t().detailModal.close }}</button>
          </div>
        </div>
      </div>
    }

    <div class="toast-stack">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'">
          <div class="toast-title">{{ toast.message }}</div>
          @if (toast.sub) { <div class="toast-sub">{{ toast.sub }}</div> }
        </div>
      }
    </div>
  `
})
export class MailboxComponent implements OnInit {
  private langSvc = inject(LanguageService);
  t = this.langSvc.select(mailboxTranslations);

  emails        = signal<IncomingEmail[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  currentPage   = signal(0);
  pageSize      = 20;

  showCreateModal = signal(false);
  selectedEmail   = signal<IncomingEmail | null>(null);
  creating        = signal(false);
  createError     = signal('');

  showDetailModal = signal(false);
  detailEmail     = signal<IncomingEmail | null>(null);

  newContact = { nom: '', prenom: '', telephone: '' };

  toasts = signal<Array<{ id: number; type: 'success' | 'error'; message: string; sub?: string }>>([]);
  private _toastId = 0;

  constructor(
    private incomingEmailService: IncomingEmailService,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    this.loadEmails();
  }

  loadEmails() {
    this.loading.set(true);
    this.incomingEmailService.getAll(this.currentPage(), this.pageSize).subscribe({
      next: (page) => {
        this.emails.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('error', this.t().toast.loadErrorTitle, this.t().toast.loadErrorSub);
      }
    });
  }

  prevPage() { if (this.currentPage() > 0) { this.currentPage.update(p => p - 1); this.loadEmails(); } }
  nextPage() { if ((this.currentPage() + 1) * this.pageSize < this.totalElements()) { this.currentPage.update(p => p + 1); this.loadEmails(); } }

  withCounts(template: string): string {
    return template.replace('{shown}', String(this.emails().length)).replace('{total}', String(this.totalElements()));
  }

  categoryBg(cat: string): string { return CATEGORY_COLORS[cat]?.bg ?? '#F3F4F6'; }
  categoryColor(cat: string): string { return CATEGORY_COLORS[cat]?.color ?? '#4B5563'; }
  categoryLabel(cat: string): string {
    return (this.t().categoryLabels as Record<string, string>)[cat] ?? cat;
  }

  openDetail(email: IncomingEmail) {
    this.detailEmail.set(email);
    this.showDetailModal.set(true);
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.detailEmail.set(null);
  }

  openCreateContact(email: IncomingEmail) {
    this.selectedEmail.set(email);
    this.newContact = { nom: '', prenom: '', telephone: '' };
    this.createError.set('');
    this.showCreateModal.set(true);
  }

  closeCreateContact() {
    this.showCreateModal.set(false);
    this.selectedEmail.set(null);
  }

  createContactAndLink() {
    const email = this.selectedEmail();
    if (!email) return;
    if (!this.newContact.nom.trim()) {
      this.createError.set(this.t().createModal.requiredFields);
      return;
    }

    this.creating.set(true);
    this.createError.set('');

    const payload: any = {
      email: email.expediteur,
      nom: this.newContact.nom,
      prenom: this.newContact.prenom,
      telephone: this.newContact.telephone,
      source: 'MANUAL',
      status: 'ABONNE',
      scoreEngagement: 0,
    };

    this.contactService.create(payload).subscribe({
      next: (contact) => {
        this.incomingEmailService.assignContact(email.id, contact.id!).subscribe({
          next: (updated) => {
            this.creating.set(false);
            this.closeCreateContact();
            this.emails.update(list => list.map(e => e.id === updated.id ? updated : e));
            this.showToast('success', this.t().toast.contactCreatedTitle, this.t().toast.contactCreatedSub);
          },
          error: () => {
            this.creating.set(false);
            this.closeCreateContact();
            this.showToast('error', this.t().toast.linkErrorTitle, this.t().toast.linkErrorSub);
          }
        });
      },
      error: () => {
        this.creating.set(false);
        this.showToast('error', this.t().toast.createErrorTitle, this.t().toast.createErrorSub);
      }
    });
  }

  showToast(type: 'success' | 'error', message: string, sub?: string) {
    const id = ++this._toastId;
    this.toasts.update(list => [...list, { id, type, message, sub }]);
    setTimeout(() => this.toasts.update(list => list.filter(x => x.id !== id)), 4000);
  }
}
