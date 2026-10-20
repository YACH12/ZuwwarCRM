import { Component, signal, computed, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

import { CampaignService, Campaign } from '../../services/campaign.service';
import { ContactService, Contact } from '../../services/contact.service';
import { TiptapEditorComponent } from '../../shared/tiptap-editor/tiptap-editor.component';
import { LanguageService } from '../../services/language.service';
import { campaignsTranslations } from '../../shared/i18n/campaigns.i18n';

interface UICampaign {
  id: number;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  status: 'Active' | 'Completed' | 'Draft' | 'Paused';
  template: string;
  templateId: number;
  audience: number;
  sent: number;
  openRate: number;
  clickRate: number;
  date: string;
  subject: string;
}

interface UITemplate {
  id: number;
  name: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  category: string;
  subject: string;
  preview: string;
  usedIn: number;
  lastUsed: string;
  htmlContent: string;
  textContent: string;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, TiptapEditorComponent],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit {

  private langSvc = inject(LanguageService);
  private sanitizer = inject(DomSanitizer);
  t = this.langSvc.select(campaignsTranslations);

  @ViewChild('tiptapEditor') tiptapEditor?: TiptapEditorComponent;

  constructor(
    private campaignService: CampaignService,
    private contactService: ContactService
  ) {}

  // ── STATE ─────────────────────────────────────────────────────────────────
  allCampaigns = signal<UICampaign[]>([]);
  campaigns    = signal<UICampaign[]>([]);
  templates    = signal<UITemplate[]>([]);
  loading      = signal(false);

  // Contacts
  allContactsList    = signal<Contact[]>([]);
  selectedContactIds = signal<number[]>([]);
  campStep           = signal(1);

  // Pagination campagnes
  currentPage    = signal(0);
  pageSize       = 10;
  totalElements  = signal(0);
  totalPages     = signal(0);

  // Pagination templates
  templatePage          = signal(0);
  templateTotalElements = signal(0);
  templateTotalPages    = signal(0);

  activeTab         = signal<'campaigns' | 'templates'>('campaigns');
  typeFilter        = signal('All');
  showCampaignModal = signal(false);
  showTemplateModal = signal(false);

  typeFilters = ['All', 'Email', 'SMS', 'WhatsApp'];

  typeFilterLabels = computed<Record<string, string>>(() => ({
    All: this.t().filters.all,
    Email: this.t().filters.email,
    SMS: this.t().filters.sms,
    WhatsApp: this.t().filters.whatsapp,
  }));

  channels = computed<{ value: 'Email' | 'SMS' | 'WhatsApp'; label: string; icon: string }[]>(() => [
    { value: 'Email',    label: this.t().channels.email,    icon: '📧' },
    { value: 'SMS',      label: this.t().channels.sms,      icon: '💬' },
    { value: 'WhatsApp', label: this.t().channels.whatsapp, icon: '🟢' },
  ]);

  newCamp = signal({
    name:         '',
    type:         'Email' as 'Email' | 'SMS' | 'WhatsApp',
    subject:      '',
    templateId:   0,
    templateName: '',
    audience:     0
  });

  newTpl = {
    name:     '',
    type:     'Email',
    category: 'Onboarding',
    subject:  '',
    body:     ''
  };

  tplName = signal('');

  onTplNameChange(value: string) {
    this.newTpl.name = value;
    this.tplName.set(value);
  }

  // ── ACTION STATE (send + delete feedback) ────────────────────────────────
  sending       = signal<number | null>(null);
  deleting      = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);
  actionSuccess = signal('');
  actionError   = signal('');

  // ── INIT ──────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCampaigns();
    this.loadTemplates();
    this.loadAllContacts();
  }

  // ── API ───────────────────────────────────────────────────────────────────
  loadCampaigns() {
    this.loading.set(true);
    this.campaignService.getAll(0, 1000).subscribe({
      next: (res: any) => {
        const data   = res.content ?? res;
        const mapped = data.map((c: Campaign) => this.mapFromApi(c));
        this.allCampaigns.set(mapped);
        this.applyFilterAndPaginate();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Campaign API error:', err);
        this.loading.set(false);
      }
    });
  }

  loadTemplates() {
    this.campaignService.getTemplates().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.content ?? []);
        const mapped = data.map((t: any) => this.mapTemplate(t));
        this.templates.set(mapped);
        this.templateTotalElements.set(Array.isArray(res) ? mapped.length : (res.totalElements ?? mapped.length));
        this.templateTotalPages.set(Array.isArray(res) ? 1 : (res.totalPages ?? 1));
      },
      error: (err) => console.error('Template API error:', err)
    });
  }

  loadAllContacts() {
    this.contactService.getAll(0, 1000).subscribe({
      next: (res: any) => {
        this.allContactsList.set(res.content ?? []);
      },
      error: (err) => console.error('Erreur contacts', err)
    });
  }

  // ── CONTACTS ──────────────────────────────────────────────────────────────
  toggleContact(id: number) {
    this.selectedContactIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  isSelected(id: number) {
    return this.selectedContactIds().includes(id);
  }

  selectAll() {
    this.selectedContactIds.set(this.allContactsList().map(c => c.id!));
  }

  deselectAll() {
    this.selectedContactIds.set([]);
  }

  // ── FILTER + PAGINATE ─────────────────────────────────────────────────────
  applyFilterAndPaginate() {
    let filtered = this.allCampaigns();
    if (this.typeFilter() !== 'All') {
      filtered = filtered.filter(c => c.type === this.typeFilter());
    }
    const total = filtered.length;
    const pages = Math.ceil(total / this.pageSize) || 1;
    if (this.currentPage() >= pages) this.currentPage.set(0);
    this.totalElements.set(total);
    this.totalPages.set(pages);
    const start = this.currentPage() * this.pageSize;
    this.campaigns.set(filtered.slice(start, start + this.pageSize));
  }

  setFilter(filter: string) {
    this.typeFilter.set(filter);
    this.currentPage.set(0);
    this.applyFilterAndPaginate();
  }

  // ── PAGINATION ────────────────────────────────────────────────────────────
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.applyFilterAndPaginate();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.applyFilterAndPaginate();
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.applyFilterAndPaginate();
  }

  nextTemplatePage() {
    if (this.templatePage() < this.templateTotalPages() - 1) {
      this.templatePage.update(p => p + 1);
      this.loadTemplates();
    }
  }

  prevTemplatePage() {
    if (this.templatePage() > 0) {
      this.templatePage.update(p => p - 1);
      this.loadTemplates();
    }
  }

  pages() {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  // ── MAPPERS ───────────────────────────────────────────────────────────────
  mapFromApi(c: Campaign): UICampaign {
    return {
      id:        c.id!,
      name:      c.name,
      type:      c.type === 'SMS' ? 'SMS' : c.type === 'WHATSAPP' ? 'WhatsApp' : 'Email',
      status:    c.statut === 'SENT' ? 'Completed'
               : c.statut === 'SENDING' ? 'Active'
               : c.statut === 'DRAFT'   ? 'Draft'
               : 'Paused',
      template:  c.template?.nom || '',
      templateId: c.template?.id || 0,
      audience:  c.contacts?.length || 0,
      sent:      c.totalSent   || 0,
      openRate:  c.openRate  || 0,
      clickRate: c.clickRate || 0,
      date:      c.sentAt || c.creatAt || '',
      subject:   c.subject
    };
  }

  mapTemplate(t: any): UITemplate {
    let uiType: 'Email' | 'SMS' | 'WhatsApp' = 'Email';
    const apiType = (t.type || t.category || '').toString().toUpperCase();
    if (apiType.includes('TRANSACTIONAL') || apiType.includes('EMAIL') || apiType.includes('MARKETING')) {
      uiType = 'Email';
    } else if (apiType.includes('SMS')) {
      uiType = 'SMS';
    } else if (apiType.includes('WHATSAPP') || apiType.includes('SOCIAL')) {
      uiType = 'WhatsApp';
    }
    return {
      id:       t.id,
      name:     t.nom || t.name || '',
      type:     uiType,
      category: t.category || t.type || '',
      subject:  t.subject || t.nom || '',
      preview:  t.textContent || t.htmlContent || t.body || '',
      usedIn:   0,
      lastUsed: t.updateAt || t.creatAt || '',
      htmlContent: t.htmlContent || '',
      textContent: t.textContent || ''
    };
  }

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  templatesWithUsage = computed<UITemplate[]>(() => {
    const tpls      = this.templates();
    const campaigns = this.allCampaigns();
    const usageCount = new Map<number, number>();
    for (const campaign of campaigns) {
      if (campaign.templateId) {
        usageCount.set(campaign.templateId, (usageCount.get(campaign.templateId) || 0) + 1);
      }
    }
    return tpls.map(tpl => ({ ...tpl, usedIn: usageCount.get(tpl.id) || 0 }));
  });

  filteredTemplates = computed<UITemplate[]>(() => {
    const tpls = this.templatesWithUsage();
    if (this.typeFilter() === 'All') return tpls;
    return tpls.filter(t => t.type === this.typeFilter());
  });

  templatesByType = computed<UITemplate[]>(() =>
    this.templatesWithUsage().filter(t => t.type === this.newCamp().type)
  );

  activeCampaigns = computed(() =>
    this.allCampaigns().filter(c => c.status === 'Active').length
  );

  totalSent = computed(() => {
    const t = this.allCampaigns().reduce((a, c) => a + c.sent, 0);
    return t >= 1000 ? (t / 1000).toFixed(1) + 'K' : t.toString();
  });

  avgOpenRate = computed(() => {
    const email = this.allCampaigns().filter(c => c.type === 'Email' && c.sent > 0);
    if (!email.length) return 0;
    return Math.round(email.reduce((a, c) => a + c.openRate, 0) / email.length);
  });

  // ── UI HELPERS ────────────────────────────────────────────────────────────
  typeIcon(type: string) {
    return type === 'Email' ? '📧' : type === 'SMS' ? '💬' : '🟢';
  }

  typeBg(type: string) {
    return type === 'Email'    ? 'rgba(99,102,241,0.15)'
         : type === 'SMS'      ? 'rgba(245,158,11,0.15)'
         : 'rgba(16,185,129,0.15)';
  }

  previewClass(type: string) {
    return type === 'SMS'      ? 'sms-preview'
         : type === 'WhatsApp' ? 'wa-preview'
         : 'email-preview';
  }

  statusColor(s: string) {
    return s === 'Active'    ? '#10B981'
         : s === 'Completed' ? '#3B82F6'
         : s === 'Paused'    ? '#F59E0B'
         : '#9CA3AF';
  }

  statusLabel(s: string) {
    const st = this.t().status;
    return s === 'Active'    ? st.active
         : s === 'Completed' ? st.completed
         : s === 'Paused'    ? st.paused
         : st.draft;
  }

  typeFilterLabel(filter: string) {
    return this.typeFilterLabels()[filter] ?? filter;
  }

  templateLabel(name: string) {
    return name || this.t().templateCard.noTemplate;
  }

  templateNameLabel(name: string) {
    return name || this.t().templateCard.unnamed;
  }

  // ── CHANNEL CHANGE & FORM UPDATE ──────────────────────────────────────────
  changeChannel(channel: 'Email' | 'SMS' | 'WhatsApp') {
    this.newCamp.update(camp => ({ ...camp, type: channel }));
  }

  updateCampName(value: string) {
    this.newCamp.update(camp => ({ ...camp, name: value }));
  }

  updateCampSubject(value: string) {
    this.newCamp.update(camp => ({ ...camp, subject: value }));
  }

  updateTemplateId(id: number) {
    const selectedTemplate = this.templatesWithUsage().find(t => t.id === id);
    this.newCamp.update(camp => ({
      ...camp,
      templateId:   id,
      templateName: selectedTemplate?.name || ''
    }));
  }

  // ── CREATE CAMPAIGN ───────────────────────────────────────────────────────
  createCampaign() {
    const camp = this.newCamp();
    if (!camp.name) return;

    const campaign: Campaign = {
      name:        camp.name,
      subject:     camp.subject,
      htmlContent: '<h1>Bonjour {{prenom}}</h1>',
      statut:      'DRAFT',
      type:        camp.type.toUpperCase() as any,
      template:    camp.templateId ? { id: camp.templateId } : undefined
    };

    this.campaignService.create(campaign).subscribe({
      next: (c) => {
        if (this.selectedContactIds().length > 0) {
          this.campaignService.addContacts(c.id!, this.selectedContactIds()).subscribe({
            next: () => {
              this.resetNewCamp();
              this.selectedContactIds.set([]);
              this.campStep.set(1);
              this.showCampaignModal.set(false);
              this.loadCampaigns();
            },
            error: (err) => console.error('Erreur ajout contacts', err)
          });
        } else {
          this.resetNewCamp();
          this.campStep.set(1);
          this.showCampaignModal.set(false);
          this.loadCampaigns();
        }
      },
      error: (err) => console.error('Erreur création campagne', err)
    });
  }

  private resetNewCamp() {
    this.newCamp.set({
      name:         '',
      type:         'Email',
      subject:      '',
      templateId:   0,
      templateName: '',
      audience:     0
    });
  }

  // ── TEMPLATE MANAGEMENT ───────────────────────────────────────────────────
  savingTpl     = signal(false);
  tplError      = signal('');
  tplAttempted  = signal(false);
  editingTplId  = signal<number | null>(null);

  tplNameError = computed(() => this.tplAttempted() && !this.newTpl.name.trim());
  tplBodyError = computed(() => this.tplAttempted() && !this.newTpl.body.trim());

  saveTemplate() {
    this.tplAttempted.set(true);

    const name = this.newTpl.name.trim();
    const body = this.newTpl.body.trim();
    if (!name || !body) return;

    const typeMap: Record<string, string> = {
      'Email':     'TRANSACTIONAL',
      'SMS':       'SMS',
      'WhatsApp':  'WHATSAPP',
    };

    const isHtml   = this.editorMode() !== 'texte';
    const template = {
      nom:         name,
      subject:     this.newTpl.subject.trim(),
      htmlContent: isHtml ? body : '',
      textContent: isHtml ? '' : body,
      type:        typeMap[this.newTpl.type] ?? 'TRANSACTIONAL',
    };

    const idEnCours = this.editingTplId();
    const requete = idEnCours
      ? this.campaignService.updateTemplate(idEnCours, template)
      : this.campaignService.createTemplate(template);

    this.savingTpl.set(true);
    this.tplError.set('');

    requete
      .pipe(finalize(() => this.savingTpl.set(false)))
      .subscribe({
        next: () => {
          this.tplName.set('');
          this.tplAttempted.set(false);
          this.editingTplId.set(null);
          this.newTpl = { name: '', type: 'Email', category: 'Onboarding', subject: '', body: '' };
          this.previewHtml.set('');
          this.previewModalOpen.set(false);
          this.showTemplateModal.set(false);
          this.loadTemplates();
        },
        error: (err) => {
          const serverMsg = err?.error?.message || err?.error?.error || err?.error;
          const msg = typeof serverMsg === 'string' && serverMsg
            ? serverMsg
            : err?.message || this.t().errors.genericSaveError.replace('{status}', String(err?.status ?? ''));
          this.tplError.set(msg);
          console.error('Erreur sauvegarde template:', err);
        }
      });
  }

  /** Ouvre la modale de template en mode édition, pré-remplie depuis la carte cliquée. */
  openEditTemplate(tpl: UITemplate) {
    this.editingTplId.set(tpl.id);
    this.tplError.set('');
    this.tplAttempted.set(false);
    this.savingTpl.set(false);
    this.tplName.set(tpl.name);
    this.newTpl = {
      name:     tpl.name,
      type:     tpl.type,
      category: tpl.category || 'Onboarding',
      subject:  tpl.subject,
      body:     tpl.htmlContent || tpl.textContent || ''
    };
    this.editorMode.set(tpl.htmlContent ? 'html' : 'texte');
    this.blocsWysiwyg.set([]);
    this.previewHtml.set('');
    this.previewModalOpen.set(false);
    this.showTemplateModal.set(true);
  }

  // ── Suppression de template (même pattern que les campagnes) ────────────
  deletingTpl        = signal<number | null>(null);
  confirmDeleteTplId = signal<number | null>(null);

  requestDeleteTpl(id: number) {
    this.confirmDeleteTplId.set(id);
  }

  cancelDeleteTpl() {
    this.confirmDeleteTplId.set(null);
  }

  confirmDeleteTpl(id: number) {
    this.confirmDeleteTplId.set(null);
    this.deletingTpl.set(id);
    this.actionSuccess.set('');
    this.actionError.set('');

    this.campaignService.deleteTemplate(id)
      .pipe(finalize(() => this.deletingTpl.set(null)))
      .subscribe({
        next: () => {
          this.loadTemplates();
          this.actionSuccess.set(this.t().toast.templateDeleteSuccess);
          setTimeout(() => this.actionSuccess.set(''), 3000);
        },
        error: (err) => {
          console.error('Erreur suppression template', err);
          const msg = err?.status === 403
            ? this.t().toast.templateDeleteForbidden
            : err?.error?.message || err?.message || this.t().toast.templateDeleteGenericError;
          this.actionError.set(msg);
          setTimeout(() => this.actionError.set(''), 5000);
        }
      });
  }

  requestDelete(id: number) {
    this.confirmDeleteId.set(id);
  }

  cancelDelete() {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number) {
    this.confirmDeleteId.set(null);
    this.deleting.set(id);
    this.actionSuccess.set('');
    this.actionError.set('');

    this.campaignService.delete(id)
      .pipe(finalize(() => this.deleting.set(null)))
      .subscribe({
        next: () => {
          this.loadCampaigns();
          this.actionSuccess.set(this.t().toast.deleteSuccess);
          setTimeout(() => this.actionSuccess.set(''), 3000);
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          const msg = err?.status === 403
            ? this.t().toast.deleteForbidden
            : err?.error?.message || err?.message || this.t().toast.deleteGenericError;
          this.actionError.set(msg);
          setTimeout(() => this.actionError.set(''), 5000);
        }
      });
  }

  useTemplate(template: UITemplate) {
    this.newCamp.set({
      name:         `${template.name} Campaign`,
      type:         template.type,
      subject:      template.subject,
      templateId:   template.id,
      templateName: template.name,
      audience:     0
    });
    this.showCampaignModal.set(true);
  }

  // ── SEND CAMPAIGN ─────────────────────────────────────────────────────────
  sendCampaign(id: number) {
    if (!confirm(this.t().confirmSend)) return;

    this.sending.set(id);
    this.actionSuccess.set('');
    this.actionError.set('');

    this.campaignService.send(id)
      .pipe(finalize(() => this.sending.set(null)))
      .subscribe({
        next: (c) => {
          this.allCampaigns.update(list =>
            list.map(item => item.id === id ? this.mapFromApi(c) : item)
          );
          this.applyFilterAndPaginate();
          const sent = c.totalSent ?? 0;
          this.actionSuccess.set(
            sent > 0
              ? this.t().toast.sendSuccessWithCount.replace('{name}', c.name).replace('{count}', String(sent))
              : this.t().toast.sendSuccessNoContacts.replace('{name}', c.name)
          );
          setTimeout(() => this.actionSuccess.set(''), 5000);
        },
        error: (err) => {
          console.error('Erreur envoi', err);
          const msg = err?.status === 403
            ? this.t().toast.sendForbidden
            : err?.status === 404
            ? this.t().toast.sendNotFound
            : err?.error?.message || this.t().toast.sendGenericError;
          this.actionError.set(msg);
          setTimeout(() => this.actionError.set(''), 6000);
        }
      });
  }

  // ── ÉDITEUR 3 MODES ───────────────────────────────────────────────────────
  editorMode = signal<'texte' | 'html' | 'visuel'>('texte');

  changerModeEditeur(mode: 'texte' | 'html' | 'visuel') {
    this.editorMode.set(mode);
  }

  variablesDisponibles = computed(() => {
    const v = this.t().variables;
    return [
      { code: '{{prenom}}',          exemple: 'Ahmed',                     label: v.firstName },
      { code: '{{nom}}',             exemple: 'Benali',                    label: v.lastName },
      { code: '{{email}}',           exemple: 'ahmed@techvision.ma',       label: v.email },
      { code: '{{telephone}}',       exemple: '0634567890',                label: v.phone },
      { code: '{{scoreEngagement}}', exemple: '87',                        label: v.engagementScore },
      { code: '{{niveauScore}}',     exemple: "Haute Intention d'achat",   label: v.scoreLevel },
      { code: '{{etape}}',           exemple: 'Engagé',                    label: v.stage },
      { code: '{{entreprise}}',      exemple: 'TechVision SARL',           label: v.company },
      { code: '{{dealTitre}}',       exemple: 'Contrat Casablanca Tech',   label: v.dealTitle },
      { code: '{{dealMontant}}',     exemple: '100 000 MAD',               label: v.dealAmount },
      { code: '{{dealStage}}',       exemple: 'NEGOCIATION',               label: v.dealStage },
      { code: '{{dealProbabilite}}', exemple: '80%',                       label: v.dealProbability },
      { code: '{{dateAujourdhui}}',  exemple: '23 juin 2026',              label: v.todayDate },
      { code: '{{nomCRM}}',          exemple: 'Zuwwar',                    label: v.crmName },
    ];
  });

  blocsVisuels = computed(() => {
    const b = this.t().visualBlocks;
    return [
      { type: 'titre',      label: b.title,      html: '<h1 style="color:#7C3AED;font-family:Arial">Votre titre ici</h1>' },
      { type: 'texte',      label: b.paragraph,  html: '<p style="font-family:Arial;color:#374151;line-height:1.6">Votre texte ici. Personnalisez avec {{prenom}} !</p>' },
      { type: 'bouton',     label: b.button,     html: '<a href="#" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-family:Arial;font-weight:bold">Cliquez ici</a>' },
      { type: 'separateur', label: b.separator,  html: '<hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>' },
      { type: 'image',      label: b.image,      html: '<img src="https://via.placeholder.com/600x200" style="width:100%;border-radius:8px" alt="Image"/>' },
      { type: 'signature',  label: b.signature,  html: '<p style="font-family:Arial;font-size:12px;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:12px">Envoyé par {{nomCRM}} • {{dateAujourdhui}}</p>' },
    ];
  });

  private substituerVariables(html: string): string {
    return html
      .replace(/{{prenom}}/g,          'Ahmed')
      .replace(/{{nom}}/g,             'Benali')
      .replace(/{{email}}/g,           'ahmed@techvision.ma')
      .replace(/{{telephone}}/g,       '0634567890')
      .replace(/{{scoreEngagement}}/g, '87')
      .replace(/{{niveauScore}}/g,     "Haute Intention d'achat")
      .replace(/{{etape}}/g,           'Engagé')
      .replace(/{{entreprise}}/g,      'TechVision SARL')
      .replace(/{{dealTitre}}/g,       'Contrat Casablanca Tech')
      .replace(/{{dealMontant}}/g,     '100 000 MAD')
      .replace(/{{dealStage}}/g,       'NEGOCIATION')
      .replace(/{{dealProbabilite}}/g, '80%')
      .replace(/{{dateAujourdhui}}/g,  new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }))
      .replace(/{{nomCRM}}/g,          'Zuwwar');
  }

  /* ── Aperçu HTML à la demande, affiché dans un modal — l'iframe isolée
     évite que le CSS de l'app n'interfère avec le rendu du template, et
     que le sanitizer Angular ne supprime les balises <style> d'un
     innerHTML classique. Le clic sur « Générer l'aperçu » ouvre le modal
     par-dessus l'éditeur, qui garde ainsi toute sa largeur pour le HTML. ── */
  previewHtml      = signal('');
  previewModalOpen = signal(false);

  genererApercu() {
    this.previewHtml.set(this.substituerVariables(this.newTpl.body));
    this.previewModalOpen.set(true);
  }

  fermerApercu() {
    this.previewModalOpen.set(false);
  }

  private wrapPreviewDocument(bodyHtml: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body { margin:0; padding:16px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#374151; }
      img { max-width:100%; }
    </style></head><body>${bodyHtml}</body></html>`;
  }

  safePreviewDoc = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.wrapPreviewDocument(this.previewHtml()))
  );

  insererVariable(variable: string) {
    if (this.editorMode() === 'visuel' && this.tiptapEditor) {
      this.tiptapEditor.insertText(variable);
      return;
    }
    this.insererDansEditeur(variable);
  }

  /** Insère un extrait à la position du curseur dans le textarea (mode texte/HTML). */
  private insererDansEditeur(snippet: string) {
    const textarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    if (!textarea) {
      this.newTpl.body += snippet;
      return;
    }
    const debut = textarea.selectionStart;
    const fin   = textarea.selectionEnd;
    this.newTpl.body =
      this.newTpl.body.substring(0, debut) +
      snippet +
      this.newTpl.body.substring(fin);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(debut + snippet.length, debut + snippet.length);
    }, 0);
  }

  /** Insère une image dans l'éditeur actif — data-URI base64 (pas de dépendance à un endpoint d'upload). */
  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (this.editorMode() === 'visuel' && this.tiptapEditor) {
          this.tiptapEditor.insertImage(dataUrl);
        } else {
          this.insererDansEditeur(`<img src="${dataUrl}" alt="Image" style="max-width:100%;border-radius:8px" />`);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  ajouterBloc(bloc: any) {
    this.newTpl.body += '\n' + bloc.html;
  }

  blocsWysiwyg  = signal<{ id: number; html: string; label: string }[]>([]);
  prochainIdBloc = 0;

  ajouterBlocWysiwyg(bloc: any) {
    this.blocsWysiwyg.update(blocs => [
      ...blocs,
      { id: this.prochainIdBloc++, html: bloc.html, label: bloc.label }
    ]);
    this.synchroniserWysiwyg();
  }

  supprimerBlocWysiwyg(id: number) {
    this.blocsWysiwyg.update(blocs => blocs.filter(b => b.id !== id));
    this.synchroniserWysiwyg();
  }

  monterBloc(index: number) {
    if (index === 0) return;
    this.blocsWysiwyg.update(blocs => {
      const arr = [...blocs];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    this.synchroniserWysiwyg();
  }

  descendreBloc(index: number) {
    if (index >= this.blocsWysiwyg().length - 1) return;
    this.blocsWysiwyg.update(blocs => {
      const arr = [...blocs];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    this.synchroniserWysiwyg();
  }

  synchroniserWysiwyg() {
    const wrapper = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
      ${this.blocsWysiwyg().map(b => b.html).join('\n')}
    </div>`;
    this.newTpl.body = wrapper.trim();
  }

  ouvrirModalTemplate() {
    this.editingTplId.set(null);
    this.tplAttempted.set(false);
    this.editorMode.set('texte');
    this.blocsWysiwyg.set([]);
    this.tplError.set('');
    this.savingTpl.set(false);
    this.tplName.set('');
    this.newTpl = { name: '', type: 'Email', category: 'Onboarding', subject: '', body: '' };
    this.previewHtml.set('');
    this.previewModalOpen.set(false);
    this.showTemplateModal.set(true);
  }
}