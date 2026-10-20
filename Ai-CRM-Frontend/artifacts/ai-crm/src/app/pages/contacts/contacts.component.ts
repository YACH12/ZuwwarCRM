import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContactService, Contact } from '../../services/contact.service';
import { EntrepriseService, Entreprise } from '../../services/entreprise.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { contactsTranslations } from '../../shared/i18n/contacts.i18n';

export interface ContactVM extends Contact {
  selected?: boolean;
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit, OnDestroy {
  private langSvc = inject(LanguageService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  t = this.langSvc.select(contactsTranslations);

  // Le staff (ADMIN/MANAGER) a toujours accès ; pour un CLIENT, l'import CSV
  // dépend du plan (exportCSV) — masqué tant que le profil n'a pas confirmé l'accès.
  canImportCsv = signal(this.authService.hasRole('ADMIN') || this.authService.hasRole('MANAGER'));

  // ── STATE ─────────────────────────────────────────────────────────────────
  search        = signal('');
  activeFilter  = signal('All');
  contacts      = signal<ContactVM[]>([]);
  entreprises   = signal<Entreprise[]>([]);
  totalElements = signal(0);
  currentPage   = signal(0);
  pageSize      = 10;
  loading           = signal(false);
  saving            = signal(false);
  saveError         = signal('');
  showAddModal      = signal(false);
  showEditModal     = signal(false);
  showDeleteModal      = signal(false);
  contactToDelete      = signal<ContactVM | null>(null);
  deletingContact      = signal(false);
  showBulkDeleteModal  = signal(false);
  deletingBulk         = signal(false);
  sortField         = signal<string>('');
  sortDir           = signal<'asc' | 'desc'>('asc');
  refreshInterval: any;

  toasts = signal<Array<{ id: number; type: 'success' | 'error' | 'info' | 'warning'; message: string; sub?: string }>>([]);
  private _toastId = 0;

  // ── FIX: statsContacts initialisé avec total=0, mis à jour dès loadContacts ──
  statsContacts = signal({ total: 0, abonnes: 0, desabonnes: 0, bounced: 0, scoreMoyen: 0 });

  filterOptions = computed(() => [
    { label: this.t().filters.all,          value: 'All',       cls: '' },
    { label: this.t().filters.subscribed,   value: 'ABONNE',    cls: 'f-green' },
    { label: this.t().filters.unsubscribed, value: 'DESABONNE', cls: 'f-red' },
    { label: this.t().filters.bounced,      value: 'BOUNCED',   cls: 'f-amber' }
  ]);

  // ── FORMS ─────────────────────────────────────────────────────────────────
  newContact: any = {
    typeContact: 'INDIVIDU', nom: '', prenom: '', email: '',
    telephone: '', source: 'MANUAL', status: 'ABONNE', entrepriseId: 0, poste: ''
  };
  editContact: Partial<Contact> = {};

  selectedIds = signal<Set<number>>(new Set());

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  filtered = computed(() => {
    let list = this.contacts();
    if (this.activeFilter() !== 'All') list = list.filter(c => c.status === this.activeFilter());
    const s = this.search().toLowerCase().trim();
    if (s) list = list.filter(c =>
      (c.nom?.toLowerCase().includes(s)) || (c.prenom?.toLowerCase().includes(s)) ||
      (c.email?.toLowerCase().includes(s)) || (c.telephone?.toLowerCase().includes(s))
    );
    return list;
  });

  allSelected      = computed(() => this.contacts().length > 0 && this.contacts().every(c => this.selectedIds().has(c.id!)));
  selectedCount    = computed(() => this.selectedIds().size);
  selectedContacts = computed(() => this.contacts().filter(c => this.selectedIds().has(c.id!)));

  get totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize);
  }

  constructor(
    private contactService: ContactService,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit() {
    this.loadContacts();
    this.loadEntreprises();
    if (this.authService.hasRole('CLIENT')) {
      this.profileService.getMe().subscribe({
        next: (me) => this.canImportCsv.set(!!me.planTier?.exportCSV),
        error: () => {}
      });
    }
    this.refreshInterval = setInterval(() => {
      if (!this.showAddModal() && !this.showEditModal()) this.loadContacts(true);
    }, 10000);
  }

  ngOnDestroy() { if (this.refreshInterval) clearInterval(this.refreshInterval); }

  // ── LOAD DATA ─────────────────────────────────────────────────────────────
  loadContacts(silent = false) {
    if (!silent) this.loading.set(true);
    this.contactService.getAll(this.currentPage(), this.pageSize).subscribe({
      next: (page) => {
        this.contacts.set(page.content.map(c => ({ ...c })));
        this.totalElements.set(page.totalElements);
        this.statsContacts.update(s => ({ ...s, total: page.totalElements }));
        this.loading.set(false);
        if (!silent) this.loadStatsContacts();
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        if (!silent) this.showToast('error', this.t().toast.loadErrorTitle, this.t().toast.loadErrorSub);
      }
    });
  }

  loadStatsContacts() {
    this.contactService.getAll(0, 1000).subscribe({
      next: (page) => {
        const list = page.content;
        const totalScore = list.reduce((s, c) => s + (c.scoreEngagement || 0), 0);
        this.statsContacts.set({
          total:      page.totalElements,
          abonnes:    list.filter(c => c.status === 'ABONNE').length,
          desabonnes: list.filter(c => c.status === 'DESABONNE').length,
          bounced:    list.filter(c => c.status === 'BOUNCED').length,
          scoreMoyen: list.length > 0 ? Math.round(totalScore / list.length) : 0
        });
      }
    });
  }

  loadEntreprises() {
    this.entrepriseService.getAll().subscribe({
      next: (res: any) => this.entreprises.set(res.content ?? res),
      error: (err) => {
        console.error(err);
        this.showToast('error', this.t().toast.loadErrorTitle, this.t().toast.loadErrorSub);
      }
    });
  }

  // ── SORT ──────────────────────────────────────────────────────────────────
  sortBy(field: keyof ContactVM) {
    const same = this.sortField() === field;
    const dir  = same && this.sortDir() === 'asc' ? 'desc' : 'asc';
    this.sortField.set(field as string);
    this.sortDir.set(dir);
    const sorted = [...this.contacts()].sort((a: any, b: any) => {
      const rawA = a[field], rawB = b[field];
      if (typeof rawA === 'number' && typeof rawB === 'number') {
        return dir === 'asc' ? rawA - rawB : rawB - rawA;
      }
      const A = (rawA ?? '').toString();
      const B = (rawB ?? '').toString();
      return dir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
    });
    this.contacts.set(sorted);
  }

  isSorted(field: string): boolean { return this.sortField() === field; }

  // ── SELECT ────────────────────────────────────────────────────────────────
  toggleSelect(id: number, checked: boolean) {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  toggleSelectAll(checked: boolean) {
    this.selectedIds.set(checked ? new Set(this.contacts().map(c => c.id!)) : new Set());
  }

  clearSelection() { this.selectedIds.set(new Set()); }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  openAddModal() {
    this.newContact = { typeContact: 'INDIVIDU', nom: '', prenom: '', email: '', telephone: '', source: 'MANUAL', status: 'ABONNE', entrepriseId: 0, poste: '' };
    this.saveError.set('');
    this.showAddModal.set(true);
  }

  // ── TOAST SYSTEM ─────────────────────────────────────────────────────────
  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, sub?: string) {
    const id = ++this._toastId;
    this.toasts.update(list => [...list, { id, type, message, sub }]);
    setTimeout(() => this.removeToast(id), 4000);
  }

  removeToast(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  saveContact() {
    if (!this.newContact.email || !this.newContact.nom) { this.saveError.set(this.t().toast.requiredFields); return; }
    this.saving.set(true);
    this.saveError.set('');
    const payload: any = {
      nom: this.newContact.nom, prenom: this.newContact.prenom, email: this.newContact.email,
      telephone: this.newContact.telephone, source: this.newContact.source, status: this.newContact.status,
      poste: this.newContact.poste, scoreEngagement: 0, deleted: false
    };
    if (this.newContact.entrepriseId && this.newContact.entrepriseId !== 0)
      payload.entreprise = { id: this.newContact.entrepriseId };
    this.contactService.create(payload).subscribe({
      next: (created) => {
        this.saving.set(false); this.showAddModal.set(false);
        this.contacts.update(list => [created as ContactVM, ...list]);
        this.totalElements.update(n => n + 1);
        this.statsContacts.update(s => ({
          ...s,
          total:      s.total + 1,
          abonnes:    created.status === 'ABONNE'    ? s.abonnes    + 1 : s.abonnes,
          desabonnes: created.status === 'DESABONNE' ? s.desabonnes + 1 : s.desabonnes,
          bounced:    created.status === 'BOUNCED'   ? s.bounced    + 1 : s.bounced
        }));
        this.showToast('success', this.t().toast.contactCreatedTitle,
          this.t().toast.contactCreatedSub.replace('{name}', `${payload.prenom || ''} ${payload.nom}`.trim()));
      },
      error: (err: any) => {
        this.saving.set(false);
        if (err?.status === 400) {
          this.saveError.set(err?.error?.error || this.t().toast.validationError);
        } else {
          this.showAddModal.set(false);
          this.loadContacts();
          this.showToast('warning', this.t().toast.contactMaybeCreatedTitle, this.t().toast.serverErrorCreateSub);
        }
      }
    });
  }

  openEditModal(contact: Contact) { this.editContact = { ...contact }; this.saveError.set(''); this.showEditModal.set(true); }

  updateContact() {
    this.saving.set(true); this.saveError.set('');
    this.contactService.update(this.editContact.id!, this.editContact as Contact).subscribe({
      next: (updated) => {
        this.saving.set(false); this.showEditModal.set(false);
        this.contacts.update(list => list.map(c => c.id === updated.id ? { ...updated } as ContactVM : c));
        this.showToast('success', this.t().toast.contactUpdatedTitle, this.t().toast.contactUpdatedSub);
      },
      error: (err: any) => {
        this.saving.set(false);
        if (err?.status === 400) {
          this.saveError.set(err?.error?.error || this.t().toast.validationError);
        } else {
          this.showEditModal.set(false);
          this.loadContacts();
          this.showToast('warning', this.t().toast.contactMaybeUpdatedTitle, this.t().toast.serverErrorUpdateSub);
        }
      }
    });
  }

  openDeleteConfirm(contact: ContactVM) {
    this.contactToDelete.set(contact);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const contact = this.contactToDelete();
    if (!contact?.id) return;
    this.deletingContact.set(true);
    this.contactService.delete(contact.id).subscribe({
      next: () => {
        this.deletingContact.set(false);
        this.showDeleteModal.set(false);
        this.contactToDelete.set(null);
        this.contacts.update(list => list.filter(c => c.id !== contact.id));
        this.totalElements.update(n => Math.max(0, n - 1));
        this.statsContacts.update(s => ({
          ...s,
          total:      Math.max(0, s.total - 1),
          abonnes:    contact.status === 'ABONNE'    ? Math.max(0, s.abonnes    - 1) : s.abonnes,
          desabonnes: contact.status === 'DESABONNE' ? Math.max(0, s.desabonnes - 1) : s.desabonnes,
          bounced:    contact.status === 'BOUNCED'   ? Math.max(0, s.bounced    - 1) : s.bounced
        }));
        this.showToast('success', this.t().toast.contactDeletedTitle,
          this.t().toast.contactDeletedSub.replace('{name}', `${contact.prenom || ''} ${contact.nom}`.trim()));
      },
      error: () => {
        this.deletingContact.set(false);
        this.showDeleteModal.set(false);
        this.showToast('error', this.t().toast.deleteFailedTitle, this.t().toast.deleteFailedRetrySub);
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.contactToDelete.set(null);
  }

  openBulkDeleteConfirm() { if (this.selectedIds().size > 0) this.showBulkDeleteModal.set(true); }
  cancelBulkDelete()      { this.showBulkDeleteModal.set(false); }

  confirmBulkDelete() {
    const ids = Array.from(this.selectedIds());
    if (!ids.length) return;
    this.deletingBulk.set(true);
    const deletedIds = new Set<number>();
    let done = 0; let errors = 0;
    ids.forEach(id => this.contactService.delete(id).subscribe({
      next: () => {
        done++;
        deletedIds.add(id);
        if (done + errors === ids.length) {
          this.deletingBulk.set(false); this.showBulkDeleteModal.set(false); this.clearSelection();
          const deleted = this.contacts().filter(c => deletedIds.has(c.id!));
          this.contacts.update(list => list.filter(c => !deletedIds.has(c.id!)));
          this.totalElements.update(n => Math.max(0, n - deletedIds.size));
          this.statsContacts.update(s => {
            const da = deleted.filter(c => c.status === 'ABONNE').length;
            const dd = deleted.filter(c => c.status === 'DESABONNE').length;
            const db = deleted.filter(c => c.status === 'BOUNCED').length;
            return { ...s, total: Math.max(0, s.total - deletedIds.size), abonnes: Math.max(0, s.abonnes - da), desabonnes: Math.max(0, s.desabonnes - dd), bounced: Math.max(0, s.bounced - db) };
          });
          if (errors === 0) this.showToast('success', this.t().toast.bulkDeletedTitle.replace('{count}', String(done)), this.t().toast.bulkDeletedSub);
          else this.showToast('warning', this.t().toast.bulkPartialTitle.replace('{done}', String(done)).replace('{errors}', String(errors)), this.t().toast.bulkPartialSub);
        }
      },
      error: () => {
        errors++;
        if (done + errors === ids.length) {
          this.deletingBulk.set(false); this.showBulkDeleteModal.set(false); this.clearSelection();
          const deletedErr = this.contacts().filter(c => deletedIds.has(c.id!));
          this.contacts.update(list => list.filter(c => !deletedIds.has(c.id!)));
          this.totalElements.update(n => Math.max(0, n - deletedIds.size));
          this.statsContacts.update(s => {
            const da = deletedErr.filter(c => c.status === 'ABONNE').length;
            const dd = deletedErr.filter(c => c.status === 'DESABONNE').length;
            const db = deletedErr.filter(c => c.status === 'BOUNCED').length;
            return { ...s, total: Math.max(0, s.total - deletedIds.size), abonnes: Math.max(0, s.abonnes - da), desabonnes: Math.max(0, s.desabonnes - dd), bounced: Math.max(0, s.bounced - db) };
          });
          this.showToast('error', this.t().toast.deleteFailedTitle, this.t().toast.deleteFailedCountSub.replace('{count}', String(errors)));
        }
      }
    }));
  }

  // ── IMPORT CSV — ENDPOINT BATCH ─────────────────────────────────────────
  onImportCSV(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    // Validation rapide côté client avant envoi
    const reader = new FileReader();
    reader.onerror = () => this.showToast('error', this.t().toast.readErrorTitle, this.t().toast.readErrorSub);
    reader.onload = (e) => {
      const raw = (e.target?.result as string).replace(/^﻿/, '').replace(/\r\n|\r/g, '\n');
      const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length < 2) {
        this.showToast('warning', this.t().toast.emptyFileTitle, this.t().toast.emptyFileSub); return;
      }

      const sep = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(sep).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

      const hasNom   = headers.some(h => ['nom', 'name', 'last_name', 'lastname'].includes(h));
      const hasEmail = headers.some(h => ['email', 'mail', 'courriel'].includes(h));

      if (!hasNom || !hasEmail) {
        this.showToast('warning', this.t().toast.missingColumnsTitle,
          this.t().toast.missingColumnsSub.replace('{headers}', headers.join(', ')));
        return;
      }

      const g = (r: Record<string, string>, ...keys: string[]) =>
        (keys.map(k => r[k]).find(v => v != null && v !== '')) ?? '';

      const rows = lines.slice(1).map(line => {
        const vals = line.split(sep).map(v => v.replace(/^["']|["']$/g, '').trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
        return obj;
      });

      const payloads = rows
        .map(r => ({
          email:     g(r, 'email', 'mail', 'courriel'),
          nom:       g(r, 'nom', 'name', 'last_name', 'lastname'),
          prenom:    g(r, 'prenom', 'firstname', 'first_name', 'prénom'),
          telephone: g(r, 'telephone', 'tel', 'phone', 'mobile', 'téléphone'),
        }))
        .filter(p => p.email !== '' && p.nom !== '');

      if (payloads.length === 0) {
        this.showToast('warning', this.t().toast.noValidContactsTitle,
          this.t().toast.missingColumnsSub.replace('{headers}', headers.join(', ')));
        return;
      }

      // Reconstruire le CSV dans l'ordre exact attendu par le backend : email, nom, prenom, telephone
      const esc = (v: string) => (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
      const csvContent = [
        'email,nom,prenom,telephone',
        ...payloads.map(p => [esc(p.email), esc(p.nom), esc(p.prenom), esc(p.telephone)].join(','))
      ].join('\n');
      const csvFile = new File([new Blob([csvContent], { type: 'text/csv' })], 'import.csv', { type: 'text/csv' });

      this.showToast('info', this.t().toast.importingTitle.replace('{count}', String(payloads.length)), file.name);
      this.loading.set(true);

      // Envoi en une seule requête batch au lieu de N appels individuels
      this.contactService.importCSV(csvFile).subscribe({
        next: (res: any) => {
          this.loading.set(false);
          this.loadContacts();
          const success  = res?.success  ?? payloads.length;
          const errCount = res?.errors?.length ?? 0;
          if (errCount === 0)
            this.showToast('success', this.t().toast.importSuccessTitle, this.t().toast.importSuccessSub.replace('{count}', String(success)));
          else
            this.showToast('warning', this.t().toast.importPartialTitle.replace('{success}', String(success)).replace('{errors}', String(errCount)), res?.message || '');
        },
        error: (err: any) => {
          this.loading.set(false);
          this.loadContacts();
          const msg = err?.error?.error || this.t().toast.importErrorGeneric;
          this.showToast('error', this.t().toast.importErrorTitle, msg);
        }
      });
    };
    reader.readAsText(file);
  }

  // ── PAGINATION ────────────────────────────────────────────────────────────
  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage.set(page);
    this.loadContacts();
  }
  nextPage() { this.goToPage(this.currentPage() + 1); }
  prevPage() { this.goToPage(this.currentPage() - 1); }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage();
    const range: number[] = [];
    for (let i = Math.max(0, cur - 2); i <= Math.min(total - 1, cur + 2); i++) range.push(i);
    return range;
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  initials(nom: string, prenom: string) { return (prenom?.[0] || '') + (nom?.[0] || ''); }

  scoreColor(score: number): string {
    if (!score) return '#94A3B8';
    return score > 70 ? '#10B981' : score > 40 ? '#F59E0B' : '#EF4444';
  }

  scoreBg(score: number): string {
    if (!score) return '#F1F5F9';
    return score > 70 ? '#D1FAE5' : score > 40 ? '#FEF3C7' : '#FEE2E2';
  }

  statusLabel(s: string): string {
    const st = this.t().status;
    return s === 'ABONNE' ? st.subscribed : s === 'DESABONNE' ? st.unsubscribed : st.bounced;
  }

  statusBg(s: string): string {
    return s === 'ABONNE' ? '#D1FAE5' : s === 'DESABONNE' ? '#FEE2E2' : '#FEF3C7';
  }

  statusColor(s: string): string {
    return s === 'ABONNE' ? '#065F46' : s === 'DESABONNE' ? '#991B1B' : '#92400E';
  }

  leadStageFr(s: string): string {
    return s === 'High_Intent' ? 'Haute intention' : s === 'Engaged' ? 'Engagé' : 'Nouveau';
  }

  leadStageBg(s: string): string {
    return s === 'High_Intent' ? '#D1FAE5' : s === 'Engaged' ? '#DBEAFE' : '#F1F5F9';
  }

  leadStageColor(s: string): string {
    return s === 'High_Intent' ? '#065F46' : s === 'Engaged' ? '#1D4ED8' : '#64748B';
  }

  sourceFr(s: string): string {
    const src = this.t().source;
    return s === 'MANUAL' ? src.manual : s === 'IMPORT' ? src.import : src.api;
  }

  paginationText(): string {
    return this.t().pagination
      .replace('{shown}', String(this.filtered().length))
      .replace('{total}', String(this.totalElements()));
  }

  withCount(template: string, count: number): string {
    return template.replace('{count}', String(count));
  }

  filterCount(value: string): number {
    if (value === 'All')       return this.totalElements();
    if (value === 'ABONNE')    return this.statsContacts().abonnes;
    if (value === 'DESABONNE') return this.statsContacts().desabonnes;
    return this.statsContacts().bounced;
  }
}