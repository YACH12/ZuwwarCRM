import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DealService, Deal } from '../../services/deal.service';
import { ContactService, Contact } from '../../services/contact.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ContactProfileModalComponent } from '../../shared/contact-profile/contact-profile-modal.component';
import { LanguageService } from '../../services/language.service';
import { dealsTranslations } from '../../shared/i18n/deals.i18n';

interface Column {
  stage: string;
  label: string;
  color: string;
  deals: Deal[];
}

const CLOSED_STAGES = ['GAGNE', 'PERDU'];


@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ContactProfileModalComponent],
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.css']
})
export class DealsComponent implements OnInit {
  private langSvc = inject(LanguageService);
  t = this.langSvc.select(dealsTranslations);

  constructor(
    private dealService: DealService,
    private contactService: ContactService,
    private router: Router
  ) {}

  allDeals  = signal<Deal[]>([]);
  contacts  = signal<Contact[]>([]);
  loading   = signal(false);
  showModal = signal(false);
  viewMode  = signal<'kanban' | 'list'>('kanban');
  errorMessage = signal('');

  private showError() {
    this.errorMessage.set(this.t().genericError);
    setTimeout(() => this.errorMessage.set(''), 5000);
  }

  // ── Tab Active / Closed ───────────────────────────────────────────────────
  dealTab = signal<'active' | 'closed'>('active');

  // Deals filtrés selon l'onglet actif
  activeDeals = computed(() =>
    this.allDeals().filter(d => !CLOSED_STAGES.includes(d.stage))
  );
  closedDeals = computed(() =>
    this.allDeals().filter(d => CLOSED_STAGES.includes(d.stage))
  );
  currentDeals = computed(() =>
    this.dealTab() === 'active' ? this.activeDeals() : this.closedDeals()
  );

  // ── Modal profil contact ──────────────────────────────────────────────────
  showContactModal  = signal(false);
  selectedContactId = signal<number | null>(null);


  stats = signal({
    totalDeals: 0,
    pipelineActif: 0,
    montantParStage: {} as Record<string, number>,
    countParStage:   {} as Record<string, number>
  });

  // Colonnes Kanban Active (sans GAGNE/PERDU)
  activeColumns: Column[] = [
    { stage: 'PROSPECT',      label: 'Prospect',      color: '#9CA3AF', deals: [] },
    { stage: 'QUALIFICATION', label: 'Qualification', color: '#3B82F6', deals: [] },
    { stage: 'PROPOSITION',   label: 'Proposition',   color: '#F59E0B', deals: [] },
    { stage: 'NEGOCIATION',   label: 'Négociation',   color: '#7C3AED', deals: [] },
  ];

  // Colonnes Kanban Closed
  closedColumns: Column[] = [
    { stage: 'GAGNE', label: 'Gagné', color: '#10B981', deals: [] },
    { stage: 'PERDU', label: 'Perdu', color: '#EF4444', deals: [] },
  ];

  get columns(): Column[] {
    return this.dealTab() === 'active' ? this.activeColumns : this.closedColumns;
  }

  get connectedStages(): string[] {
    return this.columns.map(c => c.stage);
  }

  newDeal: Partial<Deal> = { titre: '', montant: 0, stage: 'PROSPECT', contact: undefined };
  newDealContactId = 0;

  ngOnInit() {
    this.loadDeals();
    this.loadContacts();
    this.loadStats();
  }

  loadDeals() {
    this.loading.set(true);
    this.dealService.getAll().subscribe({
      next: (res: any) => {
        const deals = res.content ?? res;
        this.allDeals.set(deals);
        this.distribuerDansColonnes(deals);
        this.loading.set(false);
      },
      error: (err) => { console.error('Erreur chargement deals', err); this.loading.set(false); this.showError(); }
    });
  }

  loadContacts() {
    this.contactService.getAll(0, 1000).subscribe({
      next: (res) => this.contacts.set(res.content),
      error: (err) => console.error('Erreur chargement contacts', err)
    });
  }

  loadStats() {
    this.dealService.getStats().subscribe({
      next: (res: any) => this.stats.set(res),
      error: (err) => console.error('Erreur chargement stats deals', err)
    });
  }

  distribuerDansColonnes(deals: Deal[]) {
    [...this.activeColumns, ...this.closedColumns].forEach(col => {
      col.deals = deals.filter(d => d.stage === col.stage);
    });
    this.allDeals.set([...deals]); // trigger computed signals
  }

  switchTab(tab: 'active' | 'closed') {
    this.dealTab.set(tab);
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  onDrop(event: CdkDragDrop<Deal[]>, newStage: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const deal = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.dealService.changerStage(deal.id!, newStage).subscribe({
        next: (updated) => {
          deal.stage       = updated.stage;
          deal.probabilite = updated.probabilite;
          this.loadStats();
        },
        error: (err) => { console.error('Erreur changement de stage', err); this.showError(); this.loadDeals(); }
      });
    }
  }

  // ── Modal Contact Profil ──────────────────────────────────────────────────
  openContactProfile(contactId: number | undefined, event: MouseEvent) {
    event.stopPropagation();
    if (!contactId) return;
    this.selectedContactId.set(contactId);
    this.showContactModal.set(true);
  }

  closeContactModal() {
    this.showContactModal.set(false);
    this.selectedContactId.set(null);
  }

  navigateToContact(contactId: number) {
    this.closeContactModal();
    this.router.navigate(['/app/contacts', contactId]);
  }

  // ── Création Deal ─────────────────────────────────────────────────────────
  openModal() {
    this.newDeal = { titre: '', montant: 0, stage: 'PROSPECT' };
    this.newDealContactId = 0;
    this.showModal.set(true);
  }

  createDeal() {
    if (!this.newDeal.titre || !this.newDeal.montant) return;

    const deal: Deal = {
      titre:   this.newDeal.titre!,
      montant: this.newDeal.montant!,
      stage:   this.newDeal.stage as any,
      contact: this.newDealContactId ? { id: this.newDealContactId } : undefined
    };

    this.dealService.create(deal).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadDeals();
        this.loadStats();
      },
      error: (err) => { console.error('Erreur création deal', err); this.showError(); }
    });
  }

  deleteDeal(id: number) {
    if (confirm(this.t().confirmDelete)) {
      this.dealService.delete(id).subscribe({
        next: () => { this.loadDeals(); this.loadStats(); },
        error: (err) => { console.error('Erreur suppression deal', err); this.showError(); }
      });
    }
  }

  // ── Clôturer un deal (Gagné / Perdu) ────────────────────────────────────
  changeStage(deal: Deal, newStage: string) {
    if (deal.stage === newStage) return;
    this.dealService.changerStage(deal.id!, newStage).subscribe({
      next: (updated) => {
        deal.stage       = updated.stage;
        deal.probabilite = updated.probabilite;
        const updatedDeals = this.allDeals().map(d => d.id === deal.id ? deal : d);
        this.distribuerDansColonnes(updatedDeals);
        this.loadStats();
      },
      error: (err) => { console.error('Erreur changement de stage', err); this.showError(); this.loadDeals(); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' MAD';
  }

  totalColonne(deals: Deal[]): string {
    const total = deals.reduce((sum, d) => sum + d.montant, 0);
    return this.formatMontant(total);
  }

  probColor(prob: number = 0): string {
    if (prob >= 80) return '#10B981';
    if (prob >= 50) return '#F59E0B';
    return '#EF4444';
  }

  initials(deal: Deal): string {
    const c = deal.contact;
    if (!c) return '?';
    return ((c.nom?.[0] || '') + (c.prenom?.[0] || '')).toUpperCase();
  }

  closedStageColor(stage: string): string {
    return stage === 'GAGNE' ? '#10B981' : '#EF4444';
  }

  stageLabel(stage: string): string {
    const s = this.t().stage;
    switch (stage) {
      case 'PROSPECT':      return s.prospect;
      case 'QUALIFICATION': return s.qualification;
      case 'PROPOSITION':   return s.proposition;
      case 'NEGOCIATION':   return s.negociation;
      case 'GAGNE':         return s.gagne;
      case 'PERDU':         return s.perdu;
      default:              return stage;
    }
  }
}