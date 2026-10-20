import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientAdminService, ClientDTO } from '../../services/client-admin.service';
import { forkJoin } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AvatarService } from '../../services/avatar.service';
import { clientsTranslations } from '../../shared/i18n/clients.i18n';

const STATUT_COLORS: Record<string, string> = {
  ACTIF:    '#10B981',
  PROSPECT: '#7C3AED',
  ESSAI:    '#F59E0B',
  SUSPENDU: '#EF4444',
  EXPIRE:   '#64748B',
  CHURNED:  '#64748B',
};

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  private langSvc = inject(LanguageService);
  private avatarSvc = inject(AvatarService);
  t = this.langSvc.select(clientsTranslations);

  photoUploadTargetId: number | null = null;

  search = signal('');
  statutFilter = signal('');
  planFilter = signal('');
  errorMsg = signal('');
  planTarget = signal<ClientDTO | null>(null);
  deleteTarget = signal<ClientDTO | null>(null);
  newPlan = 'free-tier';

  clients = signal<ClientDTO[]>([]);
  scoringId = signal<number | null>(null);
  scoringAll = signal(false);

  constructor(private svc: ClientAdminService) {}

  ngOnInit() { this.load(); }

  private load() {
    this.svc.getAll().subscribe({
      next: (page) => this.clients.set(page.content),
      error: () => this.errorMsg.set(this.t().errors.loadClients)
    });
  }

  filtered = computed(() => {
    const search = this.search().trim().toLowerCase();
    const statutFilter = this.statutFilter();
    const planFilter = this.planFilter();
    return this.clients().filter(c => {
      const matchSearch = !search ||
        `${c.prenom} ${c.nom} ${c.email} ${c.nomEntreprise || ''}`.toLowerCase().includes(search);
      const matchStatut = !statutFilter || c.statut === statutFilter;
      const matchPlan = !planFilter || (c.planTier?.code || 'FREE') === planFilter;
      return matchSearch && matchStatut && matchPlan;
    });
  });

  countByStatut(s: string) { return this.clients().filter(c => c.statut === s).length; }

  avatarUrl(c: ClientDTO) { return this.avatarSvc.resolve(c.photoUrl, c.email || `${c.prenom} ${c.nom}`); }

  startPhotoUpload(c: ClientDTO, input: HTMLInputElement) {
    this.photoUploadTargetId = c.id;
    input.value = '';
    input.click();
  }

  onPhotoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const targetId = this.photoUploadTargetId;
    if (!file || targetId === null) return;
    if (file.size > 2 * 1024 * 1024) {
      this.errorMsg.set(this.t().errors.photoTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.svc.updatePhoto(targetId, dataUrl).subscribe({
        next: (updated) => {
          this.clients.update(list => list.map(x => x.id === targetId ? { ...x, photoUrl: updated.photoUrl || dataUrl } : x));
        },
        error: () => this.errorMsg.set(this.t().errors.photoUpdateError)
      });
    };
    reader.readAsDataURL(file);
  }

  statutColor(s: string) { return STATUT_COLORS[s] || '#6B7280'; }
  statutBg(s: string) { return (STATUT_COLORS[s] || '#6B7280') + '1A'; }

  formatDate(d?: string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  suspendre(c: ClientDTO) {
    this.svc.suspendre(c.id).subscribe({
      next: () => this.clients.update(list => list.map(x => x.id === c.id ? { ...x, statut: 'SUSPENDU' } : x)),
      error: () => this.errorMsg.set(this.t().errors.suspend)
    });
  }

  reactiver(c: ClientDTO) {
    this.svc.reactiver(c.id).subscribe({
      next: () => this.clients.update(list => list.map(x => x.id === c.id ? { ...x, statut: 'ACTIF' } : x)),
      error: () => this.errorMsg.set(this.t().errors.reactivate)
    });
  }

  openPlanModal(c: ClientDTO) {
    this.planTarget.set(c);
    this.newPlan = c.planTier?.code === 'PREMIUM' ? 'premium-tier' : c.planTier?.code === 'DEMO' ? 'demo-tier' : 'free-tier';
  }

  savePlan() {
    const t = this.planTarget();
    if (!t) return;
    this.svc.changerPlan(t.id, this.newPlan).subscribe({
      next: (res) => { this.load(); this.planTarget.set(null); },
      error: () => this.errorMsg.set(this.t().errors.changePlan)
    });
  }

  recalculateScore(c: ClientDTO) {
    this.scoringId.set(c.id);
    this.svc.recalculateScore(c.id).subscribe({
      next: (res) => {
        this.clients.update(list => list.map(x => x.id === c.id ? { ...x, scoreIA: res.scoreIA } : x));
        this.scoringId.set(null);
      },
      error: () => this.scoringId.set(null)
    });
  }

  recalculateAll() {
    this.scoringAll.set(true);
    this.svc.updateAllScores().subscribe({
      next: () => { this.load(); this.scoringAll.set(false); },
      error: () => this.scoringAll.set(false)
    });
  }

  confirmDelete(c: ClientDTO) { this.deleteTarget.set(c); }

  deleteClient() {
    const t = this.deleteTarget();
    if (!t) return;
    this.svc.supprimer(t.id).subscribe({
      next: () => { this.clients.update(list => list.filter(c => c.id !== t.id)); this.deleteTarget.set(null); },
      error: () => { this.deleteTarget.set(null); this.errorMsg.set(this.t().errors.delete); }
    });
  }
}