import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmtpService, SmtpConfig } from '../../services/smtp.service';
import { LanguageService } from '../../services/language.service';
import { settingsTranslations } from '../../shared/i18n/settings.i18n';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { padding: 0; }

    .page-header {
      margin-bottom: 28px;
    }
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
    }
    .page-subtitle {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
    }

    /* Section */
    .section {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #E5E7EB;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    .section-desc {
      font-size: 13px;
      color: #6B7280;
      margin: 4px 0 0;
    }

    /* Table */
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #F3F4F6;
      color: #374151;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F9FAFB; }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-active { background: #D1FAE5; color: #065F46; }
    .badge-inactive { background: #F3F4F6; color: #6B7280; }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
    }
    .badge-active .badge-dot { background: #10B981; }
    .badge-inactive .badge-dot { background: #9CA3AF; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #111827; color: #FFFFFF; }
    .btn-primary:hover:not(:disabled) { background: #1F2937; }
    .btn-outline {
      background: transparent;
      color: #374151;
      border: 1px solid #D1D5DB;
    }
    .btn-outline:hover:not(:disabled) { background: #F9FAFB; border-color: #9CA3AF; }
    .btn-success { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
    .btn-success:hover:not(:disabled) { background: #A7F3D0; }
    .btn-danger { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
    .btn-danger:hover:not(:disabled) { background: #FECACA; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }

    .actions { display: flex; gap: 6px; }

    /* Empty */
    .empty {
      text-align: center;
      padding: 48px 24px;
      color: #9CA3AF;
    }
    .empty-icon { font-size: 32px; margin-bottom: 12px; }
    .empty-text { font-size: 14px; }

    /* Loading */
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid #E5E7EB;
      border-top-color: #111827;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Toast */
    .toast-container {
      position: fixed;
      bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 9999;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 240px; max-width: 360px;
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } }
    .toast-success { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
    .toast-error { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
    .toast-info { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: #FFFFFF;
      border-radius: 12px;
      width: 480px;
      max-width: 96vw;
      max-width: calc(100vw - 32px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #E5E7EB;
    }
    .modal-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
    .modal-close {
      background: none; border: none; cursor: pointer;
      color: #9CA3AF; padding: 4px; border-radius: 4px;
      display: flex; align-items: center;
    }
    .modal-close:hover { color: #374151; background: #F3F4F6; }
    .modal-body { padding: 24px; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #E5E7EB;
    }

    /* Form */
    .form-group { margin-bottom: 16px; }
    .form-label {
      display: block;
      font-size: 13px; font-weight: 500;
      color: #374151; margin-bottom: 6px;
    }
    .form-input {
      width: 100%; padding: 9px 12px;
      border: 1px solid #D1D5DB; border-radius: 8px;
      font-size: 14px; color: #111827;
      font-family: inherit;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none; border-color: #9CA3AF;
      box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-hint { font-size: 12px; color: #9CA3AF; margin-top: 4px; }

    /* Test result */
    .test-result {
      margin-top: 12px; padding: 10px 14px;
      border-radius: 8px; font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 8px;
    }
    .test-ok { background: #D1FAE5; color: #065F46; }
    .test-fail { background: #FEF2F2; color: #B91C1C; }
  `],
  template: `
    <div class="page">

      <div class="page-header">
        <h1 class="page-title">{{ t().title }}</h1>
        <p class="page-subtitle">{{ t().subtitle }}</p>
      </div>

      <!-- SMTP section -->
      <div class="section">
        <div class="section-header">
          <div>
            <h2 class="section-title">{{ t().smtp.sectionTitle }}</h2>
            <p class="section-desc">{{ t().smtp.sectionDesc }}</p>
          </div>
          <button class="btn btn-primary" (click)="openCreate()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ t().smtp.addSmtp }}
          </button>
        </div>

        @if (loading()) {
          <div class="empty">
            <div class="spinner" style="width:24px;height:24px;margin:0 auto 12px"></div>
            <p class="empty-text">{{ t().smtp.loading }}</p>
          </div>
        } @else if (smtps().length === 0) {
          <div class="empty">
            <div class="empty-icon">📧</div>
            <p class="empty-text">{{ t().smtp.emptyText }}</p>
          </div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{{ t().smtp.table.host }}</th>
                  <th>{{ t().smtp.table.port }}</th>
                  <th>{{ t().smtp.table.username }}</th>
                  <th>{{ t().smtp.table.status }}</th>
                  <th>{{ t().smtp.table.actions }}</th>
                </tr>
              </thead>
              <tbody>
                @for (smtp of smtps(); track smtp.id) {
                  <tr>
                    <td><strong>{{ smtp.host }}</strong></td>
                    <td>{{ smtp.port }}</td>
                    <td>{{ smtp.username }}</td>
                    <td>
                      @if (smtp.active) {
                        <span class="badge badge-active">
                          <span class="badge-dot"></span>{{ t().smtp.status.active }}
                        </span>
                      } @else {
                        <span class="badge badge-inactive">
                          <span class="badge-dot"></span>{{ t().smtp.status.inactive }}
                        </span>
                      }
                    </td>
                    <td>
                      <div class="actions">
                        @if (!smtp.active) {
                          <button class="btn btn-sm btn-success"
                                  [disabled]="actionId() === smtp.id"
                                  (click)="activate(smtp.id!)">
                            @if (actionId() === smtp.id && actionType() === 'activate') {
                              <span class="spinner"></span>
                            }
                            {{ t().smtp.actions.activate }}
                          </button>
                        }
                        <button class="btn btn-sm btn-outline"
                                [disabled]="actionId() === smtp.id"
                                (click)="openTest(smtp)">
                          @if (actionId() === smtp.id && actionType() === 'test') {
                            <span class="spinner"></span>
                          } @else {
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          }
                          {{ t().smtp.actions.test }}
                        </button>
                        <button class="btn btn-sm btn-outline"
                                (click)="openEdit(smtp)">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          {{ t().smtp.actions.edit }}
                        </button>
                        <button class="btn btn-sm btn-danger"
                                [disabled]="actionId() === smtp.id"
                                (click)="deleteSMTP(smtp.id!)">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          {{ t().smtp.actions.delete }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

    </div>

    <!-- Modal: Create / Edit -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()" (keydown.escape)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" [attr.aria-label]="editingId() ? t().modal.editTitle : t().modal.addTitle">
          <div class="modal-header">
            <h3 class="modal-title">{{ editingId() ? t().modal.editTitle : t().modal.addTitle }}</h3>
            <button class="modal-close" (click)="closeModal()" aria-label="Fermer">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">{{ t().modal.hostLabel }}</label>
              <input class="form-input" type="text" [(ngModel)]="form.host"
                     [placeholder]="t().modal.hostPlaceholder" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t().modal.portLabel }}</label>
                <input class="form-input" type="number" [(ngModel)]="form.port"
                       [placeholder]="t().modal.portPlaceholder" />
                <p class="form-hint">{{ t().modal.portHint }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t().modal.protocolLabel }}</label>
                <input class="form-input" type="text" value="STARTTLS" disabled />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t().modal.usernameLabel }}</label>
              <input class="form-input" type="email" [(ngModel)]="form.username"
                     [placeholder]="t().modal.usernamePlaceholder" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t().modal.passwordLabel }}</label>
              <input class="form-input" type="password" [(ngModel)]="form.password"
                     [placeholder]="t().modal.passwordPlaceholder" />
              <p class="form-hint">{{ t().modal.passwordHint }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">{{ t().modal.cancel }}</button>
            <button class="btn btn-primary" (click)="saveSmtp()"
                    [disabled]="saving()">
              @if (saving()) { <span class="spinner"></span> }
              {{ editingId() ? t().modal.update : t().modal.create }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Toast notifications -->
    <div class="toast-container">
      @for (toastItem of toasts(); track toastItem.id) {
        <div class="toast" [class.toast-success]="toastItem.type === 'success'"
             [class.toast-error]="toastItem.type === 'error'"
             [class.toast-info]="toastItem.type === 'info'">
          {{ toastItem.message }}
        </div>
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private langSvc = inject(LanguageService);
  t = this.langSvc.select(settingsTranslations);

  smtps = signal<SmtpConfig[]>([]);
  loading = signal(false);
  saving = signal(false);
  actionId = signal<number | null>(null);
  actionType = signal<string>('');
  showModal = signal(false);
  editingId = signal<number | null>(null);
  toasts = signal<{ id: number; message: string; type: string }[]>([]);
  private _toastCounter = 0;

  form: Partial<SmtpConfig> = { host: '', port: 587, username: '', password: '' };

  constructor(private smtpService: SmtpService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.smtpService.getAll(0, 50).subscribe({
      next: (page) => {
        this.smtps.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.toast(this.t().toast.loadFailed, 'error');
        this.loading.set(false);
      }
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { host: '', port: 587, username: '', password: '' };
    this.showModal.set(true);
  }

  openEdit(smtp: SmtpConfig) {
    this.editingId.set(smtp.id!);
    this.form = { ...smtp };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveSmtp() {
    if (!this.form.host || !this.form.port || !this.form.username || !this.form.password) {
      this.toast(this.t().toast.requiredFields, 'error');
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const payload = this.form as SmtpConfig;
    const req = id
      ? this.smtpService.update(id, payload)
      : this.smtpService.create(payload);

    req.subscribe({
      next: () => {
        this.toast(id ? this.t().toast.smtpUpdated : this.t().toast.smtpCreated, 'success');
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: () => {
        this.toast(this.t().toast.saveFailed, 'error');
        this.saving.set(false);
      }
    });
  }

  activate(id: number) {
    this.actionId.set(id);
    this.actionType.set('activate');
    this.smtpService.activate(id).subscribe({
      next: () => {
        this.toast(this.t().toast.activateSuccess, 'success');
        this.actionId.set(null);
        this.load();
      },
      error: () => {
        this.toast(this.t().toast.activateFailed, 'error');
        this.actionId.set(null);
      }
    });
  }

  openTest(smtp: SmtpConfig) {
    this.actionId.set(smtp.id!);
    this.actionType.set('test');
    this.smtpService.testConnection(smtp.id!).subscribe({
      next: (res) => {
        this.toast(res.message, res.success ? 'success' : 'error');
        this.actionId.set(null);
      },
      error: () => {
        this.toast(this.t().toast.connectionTestFailed, 'error');
        this.actionId.set(null);
      }
    });
  }

  deleteSMTP(id: number) {
    if (!confirm(this.t().confirm.deleteSmtp)) return;
    this.actionId.set(id);
    this.smtpService.delete(id).subscribe({
      next: () => {
        this.toast(this.t().toast.smtpDeleted, 'success');
        this.actionId.set(null);
        this.load();
      },
      error: () => {
        this.toast(this.t().toast.deleteFailed, 'error');
        this.actionId.set(null);
      }
    });
  }

  private toast(message: string, type: 'success' | 'error' | 'info') {
    const id = ++this._toastCounter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => {
      this.toasts.update(t => t.filter(x => x.id !== id));
    }, 4000);
  }
}
