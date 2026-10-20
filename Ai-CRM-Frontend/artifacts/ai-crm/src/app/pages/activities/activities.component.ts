import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActiviteService, Activite } from '../../services/activite.service';
import { ContactService, Contact } from '../../services/contact.service';
import { DealService, Deal } from '../../services/deal.service';
import { KeycloakService } from 'keycloak-angular';
import { LanguageService } from '../../services/language.service';
import { activitiesTranslations } from '../../shared/i18n/activities.i18n';

interface GroupeActivites {
  label: string;
  activites: Activite[];
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {

  private langSvc = inject(LanguageService);
  t = this.langSvc.select(activitiesTranslations);

  constructor(
    private activiteService: ActiviteService,
    private contactService: ContactService,
    private dealService: DealService,
    private keycloak: KeycloakService
  ) {}

  activites      = signal<Activite[]>([]);
  contacts       = signal<Contact[]>([]);
  deals          = signal<Deal[]>([]);
  stats          = signal<any>({});
  loading        = signal(false);
  showModal      = signal(false);
  filtreType     = signal<string>('TOUT');
  rechercheQuery = signal<string>('');
  filtresStatut  = signal<string[]>([]);
  filtrePriorite = signal<string[]>([]);

  newActivite: any = {
    type: 'TACHE', titre: '', description: '',
    priorite: 'NORMALE', contactId: null, dealId: null, dateEcheance: ''
  };

  get typeOptions() {
    const t = this.t();
    return [
      { label: t.typeOptions.all,    value: 'TOUT' },
      { label: t.typeOptions.task,   value: 'TACHE' },
      { label: t.typeOptions.note,   value: 'NOTE' },
      { label: t.typeOptions.system, value: 'SYSTEME' }
    ];
  }

  get statutOptions() {
    const t = this.t();
    return [
      { label: t.statusOptions.todo,       value: 'A_FAIRE',  dotClass: 'sdot-todo' },
      { label: t.statusOptions.inProgress, value: 'EN_COURS', dotClass: 'sdot-progress' },
      { label: t.statusOptions.done,       value: 'TERMINEE', dotClass: 'sdot-done' }
    ];
  }

  get prioriteOptions() {
    const t = this.t();
    return [
      { label: t.priorityOptions.high,   value: 'HAUTE',   dotClass: 'sdot-haute' },
      { label: t.priorityOptions.normal, value: 'NORMALE', dotClass: 'sdot-normale' },
      { label: t.priorityOptions.low,    value: 'BASSE',   dotClass: 'sdot-basse' }
    ];
  }

  ngOnInit() {
    this.loadActivites();
    this.loadStats();
    this.loadContacts();
    this.loadDeals();
  }

  loadActivites() {
    this.loading.set(true);
    this.activiteService.getAll().subscribe({
      next: (res: any) => { this.activites.set(res.content ?? res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadStats() {
    this.activiteService.getStats().subscribe({ next: (res) => this.stats.set(res) });
  }

  loadContacts() {
    this.contactService.getAll(0, 1000).subscribe({ next: (res) => this.contacts.set(res.content) });
  }

  loadDeals() {
    this.dealService.getAll().subscribe({ next: (res: any) => this.deals.set(res.content ?? res) });
  }

  get activitesFiltrees(): Activite[] {
    let liste = this.activites();
    const type = this.filtreType();
    if (type !== 'TOUT') liste = liste.filter(a => a.type === type);
    const query = this.rechercheQuery().toLowerCase().trim();
    if (query) liste = liste.filter(a =>
      a.titre.toLowerCase().includes(query) ||
      (a.description?.toLowerCase().includes(query) ?? false) ||
      (a.contact?.nom?.toLowerCase().includes(query) ?? false) ||
      (a.deal?.titre?.toLowerCase().includes(query) ?? false)
    );
    const statuts = this.filtresStatut();
    if (statuts.length) liste = liste.filter(a => a.statut && statuts.includes(a.statut));
    const priorites = this.filtrePriorite();
    if (priorites.length) liste = liste.filter(a => a.priorite && priorites.includes(a.priorite));
    return liste;
  }

  get activitesGroupees(): GroupeActivites[] {
    const liste = this.activitesFiltrees;
    const startOfDay = (d: Date) => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
    const today     = startOfDay(new Date());
    const yesterday = today - 86_400_000;
    const weekAgo   = today - 7 * 86_400_000;
    const labels = this.t().groups;
    const groups: Record<string, Activite[]> = {
      [labels.today]: [], [labels.yesterday]: [], [labels.thisWeek]: [], [labels.older]: []
    };
    for (const a of liste) {
      const t = a.dateCreation ? startOfDay(new Date(a.dateCreation)) : today;
      if (t === today)          groups[labels.today].push(a);
      else if (t === yesterday) groups[labels.yesterday].push(a);
      else if (t >= weekAgo)    groups[labels.thisWeek].push(a);
      else                      groups[labels.older].push(a);
    }
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([label, activites]) => ({ label, activites }));
  }

  get hasActiveFilters(): boolean {
    return this.filtreType() !== 'TOUT' || this.rechercheQuery().trim().length > 0 ||
           this.filtresStatut().length > 0 || this.filtrePriorite().length > 0;
  }

  toggleStatutFiltre(s: string) {
    const c = this.filtresStatut();
    this.filtresStatut.set(c.includes(s) ? c.filter(x => x !== s) : [...c, s]);
  }

  togglePrioriteFiltre(p: string) {
    const c = this.filtrePriorite();
    this.filtrePriorite.set(c.includes(p) ? c.filter(x => x !== p) : [...c, p]);
  }

  resetFiltres() {
    this.filtreType.set('TOUT'); this.rechercheQuery.set('');
    this.filtresStatut.set([]); this.filtrePriorite.set([]);
  }

  async creer() {
    if (!this.newActivite.titre) return;
    const profil = this.keycloak.getUsername();
    const roles  = this.keycloak.getUserRoles();
    const role   = roles.includes('ADMIN') ? 'ADMIN' : 'MANAGER';
    const payload = { ...this.newActivite, creePar: profil, roleCreateur: role, dateEcheance: this.newActivite.dateEcheance || null };
    this.activiteService.creer(payload).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadActivites(); this.loadStats();
        this.newActivite = { type: 'TACHE', titre: '', description: '', priorite: 'NORMALE', contactId: null, dealId: null, dateEcheance: '' };
      }
    });
  }

  changerStatut(activite: Activite, statut: string) {
    this.activiteService.changerStatut(activite.id!, statut).subscribe({ next: () => this.loadActivites() });
  }

  supprimer(id: number) {
    if (confirm(this.t().confirmDelete)) {
      this.activiteService.supprimer(id).subscribe({ next: () => { this.loadActivites(); this.loadStats(); } });
    }
  }

  isOverdue(a: Activite): boolean {
    if (!a.dateEcheance || a.statut === 'TERMINEE') return false;
    return new Date(a.dateEcheance) < new Date();
  }

  borderClass(a: Activite): string {
    if (a.statut === 'TERMINEE') return 'border-done';
    if (this.isOverdue(a))       return 'border-overdue';
    if (a.priorite === 'HAUTE')  return 'border-haute';
    if (a.priorite === 'NORMALE')return 'border-normale';
    if (a.priorite === 'BASSE')  return 'border-basse';
    return '';
  }

  statutBadgeClass(statut: string): string {
    return statut === 'TERMINEE' ? 'badge-done' : statut === 'EN_COURS' ? 'badge-progress' :
           statut === 'ANNULEE'  ? 'badge-cancelled' : 'badge-todo';
  }

  prioriteBadgeClass(priorite: string): string {
    return priorite === 'HAUTE' ? 'badge-haute' : priorite === 'NORMALE' ? 'badge-normale' : 'badge-basse';
  }

  labelType(type: string): string {
    const t = this.t();
    return type === 'TACHE' ? t.modal.task : type === 'NOTE' ? t.modal.note : t.typeOptions.system;
  }

  labelStatut(statut: string): string {
    const s = this.t().statusOptions;
    const m: Record<string,string> = { A_FAIRE:s.todo, EN_COURS:s.inProgress, TERMINEE:s.done, ANNULEE:s.cancelled };
    return m[statut] ?? statut;
  }

  labelPriorite(priorite: string): string {
    const p = this.t().priorityOptions;
    const m: Record<string,string> = { HAUTE:p.high, NORMALE:p.normal, BASSE:p.low };
    return m[priorite] ?? priorite;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
}
