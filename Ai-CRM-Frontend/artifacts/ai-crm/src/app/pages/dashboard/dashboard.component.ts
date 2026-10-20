import { Component, signal, computed, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { forkJoin, catchError, of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { dashboardTranslations } from '../../shared/i18n/dashboard.i18n';

interface StatCard {
  label: string;
  value: string | number;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  icon: 'users' | 'briefcase' | 'trophy' | 'cpu';
  color: string;
  sparkline: string;
}

interface RecentContact {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  scoreEngagement: number;
  leadStage: string;
  status: string;
  source: string;
  creatAt?: string;
}

interface RecentDeal {
  id: number;
  titre: string;
  montant: number;
  stage: string;
  probabilite: number;
  contact?: { prenom: string; nom: string };
  createdAt?: string;
  dateCloture?: string;
  dateClotureEstimee?: string;
}

interface TrendPoint { label: string; value: number; x: number; y: number }
interface WonLostBar { label: string; won: number; lost: number; xWon: number; xLost: number; yWon: number; yLost: number; hWon: number; hLost: number; barW: number }

interface RecentActivite {
  id: number;
  type: string;
  titre: string;
  creePar: string;
  dateCreation: string;
  contact?: { prenom: string; nom: string };
  deal?: { titre?: string };
}

interface TimelineGroup { key: string; label: string; items: RecentActivite[] }

interface RecentCampaign {
  id: number;
  name: string;
  subject?: string;
  type?: 'EMAIL' | 'SMS' | 'WHATSAPP';
  statut?: string;
}

/* ── Tooltip riche partagé entre les graphiques de tendance / anneaux ── */
interface TipLine { label: string; value: string; color: string; }
interface TipState { chartId: string; pointIndex: number; xPct: number; yPct: number; title: string; lines: TipLine[]; }

/* ── État de zoom/pan générique (molette = zoom, glisser = pan) ── */
interface ZoomState { scale: number; tx: number; ty: number; panning: boolean; startX: number; startY: number; }

/* ─────────────────────────────────────────────────────────
   PALETTE — un seul accent (indigo), le reste en encre neutre.
   Le vert/rouge ne sert plus qu'à des signaux ponctuels
   (gagné / perdu, up / down) et non à colorer des blocs entiers.
───────────────────────────────────────────────────────── */
const ACCENT   = '#7C3AED'; // violet — accent unique (aligné sur le bouton principal)
const SUCCESS  = '#16A34A'; // gagné / positif
const DANGER   = '#DC2626'; // perdu / négatif
const INK_700  = '#334155';
const INK_500  = '#64748B';
const INK_400  = '#94A3B8';
const INK_300  = '#CBD5E1';

/* Rampe violette — campagnes (pie chart) & taux de closing (segment "en cours") */
const VIOLET_SHADES = ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'];

/* ─────────────────────────────────────────────────────────
   Géométrie des graphiques temporels (courbe / aire / histogramme)
   viewBox commun : 0 0 260 90, tracé entre PAD_X et 260-PAD_X,
   entre PAD_TOP et BASELINE (le reste sert aux libellés de mois).
───────────────────────────────────────────────────────── */
const CHART_W    = 260;
const CHART_H    = 118;
const PAD_X      = 6;
const PAD_TOP    = 8;
const BASELINE   = 102;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3.5;
const ZOOM_STEP = 0.18;

/* Sparklines des cartes KPI */
const SPARK_W = 68;
const SPARK_H = 26;

/* Créneaux horaires affichés sous la heatmap d'activité */
const HEATMAP_HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private api = '';
  private langSvc = inject(LanguageService);
  t = this.langSvc.select(dashboardTranslations);
  readonly chartBaseline = BASELINE;
  readonly chartW = CHART_W;
  readonly chartH = CHART_H;
  readonly heatmapHourLabels = HEATMAP_HOUR_LABELS;
  readonly trendMonthOptions = [3, 6, 12];

  /* ── Fenêtre glissante des tendances (3 / 6 / 12 mois) ── */
  trendMonths = signal(6);
  setTrendMonths(n: number) { this.trendMonths.set(n); }
  periodLabel = computed(() => this.t().trends.lastNMonths.replace('{n}', String(this.trendMonths())));

  constructor(
    private http: HttpClient,
    private keycloak: KeycloakService,
    private cdr: ChangeDetectorRef
  ) {}

  loading           = signal(true);
  username          = signal('');
  greetingPeriod    = signal<'morning' | 'afternoon' | 'evening'>('morning');
  greeting          = computed(() => this.t().greeting[this.greetingPeriod()]);
  private todayDate = new Date();
  today             = computed(() => this.todayDate.toLocaleDateString(
    this.langSvc.lang() === 'ar' ? 'ar-MA' : this.langSvc.lang(),
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  ));

  totalContacts     = signal(0);
  totalDeals        = signal(0);
  pipelineActif     = signal(0);
  dealsGagnes       = signal(0);
  scoresMoyen       = signal(0);
  campagnesEnvoyees = signal(0);
  dealsPerdu        = signal(0);
  dealsEnCours      = signal(0);

  allContacts     = signal<RecentContact[]>([]);
  allDeals        = signal<RecentDeal[]>([]);
  allActivites    = signal<RecentActivite[]>([]);
  recentActivites = computed(() => this.allActivites().slice(0, 12));
  allCampaigns    = signal<RecentCampaign[]>([]);

  /* ── Animation d'entrée ── */
  revealed = signal(false);

  /* ── Compteurs animés (count-up) pour les cartes KPI ── */
  animContacts = signal(0);
  animPipeline = signal(0);
  animGagnes   = signal(0);
  animScore    = signal(0);

  /* ── Tooltip riche (survol des points / barres / anneaux) ── */
  tip = signal<TipState | null>(null);

  /* ── Ligne/colonne survolée (mise en valeur ponctuelle) ── */
  hoveredStage  = signal<string | null>(null);

  /* ── Zoom / pan générique, clé = id du graphique ── */
  private zooms: Record<string, ZoomState> = {};

  private freshZoom(): ZoomState { return { scale: 1, tx: 0, ty: 0, panning: false, startX: 0, startY: 0 }; }

  getZoom(id: string): ZoomState {
    if (!this.zooms[id]) this.zooms[id] = this.freshZoom();
    return this.zooms[id];
  }

  isZoomed(id: string): boolean { return this.getZoom(id).scale > 1.001; }

  zoomStyle(id: string): string {
    const z = this.getZoom(id);
    return `transform: scale(${z.scale}) translate(${(z.tx / z.scale).toFixed(2)}px, ${(z.ty / z.scale).toFixed(2)}px)`;
  }

  /** Contre-échelle appliquée au tooltip pour qu'il garde une taille lisible même zoomé. */
  tipCounterScale(id: string): string {
    const z = this.getZoom(id);
    return `scale(${(1 / z.scale).toFixed(3)})`;
  }

  onZoomWheel(evt: WheelEvent, id: string) {
    evt.preventDefault();
    const z = this.getZoom(id);
    const dir = evt.deltaY < 0 ? 1 : -1;
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z.scale + dir * ZOOM_STEP));
    if (next === z.scale) return;
    if (next <= ZOOM_MIN) { z.tx = 0; z.ty = 0; }
    z.scale = next;
    this.zooms[id] = { ...z };
  }

  onZoomPanStart(evt: MouseEvent, id: string) {
    const z = this.getZoom(id);
    if (z.scale <= ZOOM_MIN) return;
    z.panning = true;
    z.startX = evt.clientX - z.tx;
    z.startY = evt.clientY - z.ty;
  }

  onZoomPanMove(evt: MouseEvent, id: string) {
    const z = this.zooms[id];
    if (!z || !z.panning) return;
    z.tx = evt.clientX - z.startX;
    z.ty = evt.clientY - z.startY;
    this.zooms[id] = { ...z };
  }

  onZoomPanEnd(id: string) {
    const z = this.zooms[id];
    if (z) z.panning = false;
  }

  resetZoom(id: string, evt?: Event) {
    evt?.stopPropagation();
    this.zooms[id] = this.freshZoom();
  }

  /* ── Score IA moyen des contacts acquis, par mois (proxy de tendance) ── */
  scoreTrend = computed<number[]>(() => {
    const buckets = this.monthBuckets();
    const contacts = this.allContacts();
    return buckets.map(b => {
      const list = contacts.filter(c => this.inBucket(c.creatAt, b.year, b.month));
      if (!list.length) return 0;
      return Math.round(list.reduce((s, c) => s + (c.scoreEngagement ?? 0), 0) / list.length);
    });
  });

  /** Chemin SVG d'une mini-courbe (sparkline) normalisée dans un cadre w×h. */
  private sparklinePath(values: number[], w: number, h: number): string {
    if (!values.length) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = values.length > 1 ? w / (values.length - 1) : 0;
    return values.map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  /* ── KPI cards — icônes neutres, accent réservé au trend, sparkline de tendance ── */
  stats = computed<StatCard[]>(() => {
    const t = this.t();
    const contactsVals = this.newContactsTrend().map(p => p.value);
    const pipelineVals = this.pipelineTrend().map(p => p.value);
    const wonVals = this.wonLostTrend().map(p => p.won);
    const scoreVals = this.scoreTrend();
    return [
      { label: t.kpi.contacts, value: Math.round(this.animContacts()), delta: t.delta.contactsThisMonth, trend: 'up', icon: 'users', color: INK_700, sparkline: this.sparklinePath(contactsVals, SPARK_W, SPARK_H) },
      { label: t.kpi.pipeline, value: this.formatMontant(Math.round(this.animPipeline())), delta: t.delta.inProgress, trend: 'up', icon: 'briefcase', color: INK_700, sparkline: this.sparklinePath(pipelineVals, SPARK_W, SPARK_H) },
      { label: t.kpi.won, value: Math.round(this.animGagnes()), delta: t.delta.thisQuarter, trend: 'up', icon: 'trophy', color: INK_700, sparkline: this.sparklinePath(wonVals, SPARK_W, SPARK_H) },
      { label: t.kpi.avgScore, value: Math.round(this.animScore()) + '/100', delta: t.delta.allContacts, trend: this.scoresMoyen() > 50 ? 'up' : 'down', icon: 'cpu', color: INK_700, sparkline: this.sparklinePath(scoreVals, SPARK_W, SPARK_H) }
    ];
  });

  /* ── Pipeline par étape — rampe de gris/indigo, vert/rouge réservés au dénouement ── */
  pipelineStages = computed(() => {
    const deals = this.allDeals();
    const s = this.t().stage;
    const cfg = [
      { key: 'PROSPECT',      label: s.prospect,      color: INK_300 },
      { key: 'QUALIFICATION', label: s.qualification, color: INK_400 },
      { key: 'PROPOSITION',   label: s.proposal,      color: INK_500 },
      { key: 'NEGOCIATION',   label: s.negotiation,   color: ACCENT },
      { key: 'GAGNE',         label: s.won,           color: SUCCESS },
      { key: 'PERDU',         label: s.lost,          color: DANGER },
    ];
    const rows = cfg.map(s => {
      const list = deals.filter(d => d.stage === s.key);
      return { ...s, count: list.length, montant: list.reduce((a, d) => a + (d.montant ?? 0), 0) };
    });
    const max = Math.max(...rows.map(r => r.count), 1);
    return rows.filter(r => r.count > 0).map(r => ({ ...r, pct: Math.max(Math.round((r.count / max) * 100), 5) }));
  });

  setHoverStage(key: string | null) { this.hoveredStage.set(key); }

  /* ── Entonnoir des leads (funnel) — rampe violette progressive + vert/rouge au dénouement ── */
  leadFunnel = computed(() => {
    const contacts = this.allContacts();
    const stageOrder: Record<string, number> = {
      NOUVEAU: 0, CONTACTE: 1, CONTACTÉ: 1, QUALIFIE: 2, QUALIFIÉ: 2,
      PROPOSITION: 3, CONVERTI: 4, PERDU: 5
    };
    const style: Record<string, { color: string; text: string }> = {
      NOUVEAU:     { color: '#EDE9FE', text: INK_700 },
      CONTACTE:    { color: '#C4B5FD', text: INK_700 },
      CONTACTÉ:    { color: '#C4B5FD', text: INK_700 },
      QUALIFIE:    { color: '#A78BFA', text: '#FFFFFF' },
      QUALIFIÉ:    { color: '#A78BFA', text: '#FFFFFF' },
      PROPOSITION: { color: '#7C3AED', text: '#FFFFFF' },
      CONVERTI:    { color: SUCCESS,   text: '#FFFFFF' },
      PERDU:       { color: DANGER,    text: '#FFFFFF' },
    };
    const map = new Map<string, number>();
    contacts.forEach(c => {
      const stage = (c.leadStage || 'NOUVEAU').toUpperCase();
      map.set(stage, (map.get(stage) ?? 0) + 1);
    });
    const entries = [...map.entries()].sort((a, b) => (stageOrder[a[0]] ?? 9) - (stageOrder[b[0]] ?? 9));
    const first = entries[0]?.[1] ?? 1;
    let prev: number | null = null;
    return entries.map(([stage, count]) => {
      const s = style[stage] ?? { color: '#7C3AED', text: '#FFFFFF' };
      const convPct = prev === null ? null : (prev === 0 ? 0 : Math.round((count / prev) * 100));
      prev = count;
      return {
        stage, label: this.leadStageLabel(stage),
        color: s.color, textColor: s.text,
        count,
        pct: Math.max(Math.round((count / first) * 100), 14),
        convPct,
      };
    });
  });

  /* ── Campagnes par type — pie chart plein, référence CampaignService (EMAIL/SMS/WHATSAPP) ── */
  campaignsByType = computed(() => {
    const camps = this.allCampaigns();
    if (!camps.length) return [];
    const ct = this.t().campaignType;
    const labels: Record<string, string> = { EMAIL: ct.email, SMS: ct.sms, WHATSAPP: ct.whatsapp };
    const colors: Record<string, string> = { EMAIL: VIOLET_SHADES[2], SMS: VIOLET_SHADES[4], WHATSAPP: VIOLET_SHADES[6] };
    const map = new Map<string, number>();
    camps.forEach(c => {
      const ty = (c.type || 'EMAIL').toUpperCase();
      map.set(ty, (map.get(ty) ?? 0) + 1);
    });
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, n]) => s + n, 0);
    if (!total) return [];
    let a = -Math.PI / 2;
    return entries.map(([ty, count], i) => {
      const frac = count / total;
      const sweep = frac * 2 * Math.PI;
      const ea = a + sweep;
      const midAngle = a + sweep / 2;
      const path = this.arcSlicePath(60, 60, 50, 0, a, ea, frac);
      a = ea;
      return { key: ty, label: labels[ty] ?? ty, color: colors[ty] ?? ACCENT, count, percentage: Math.round(frac * 100), path, midAngle, index: i };
    });
  });

  /** Construit le chemin SVG d'une part d'anneau/camembert (r=0 → pie plein, r>0 → donut). */
  private arcSlicePath(cx: number, cy: number, R: number, r: number, startAngle: number, endAngle: number, frac: number): string {
    const sweep = endAngle - startAngle;
    const x1 = cx + R * Math.cos(startAngle), y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle),   y2 = cy + R * Math.sin(endAngle);
    const lg = sweep > Math.PI ? 1 : 0;
    if (frac >= 0.9999) {
      return r > 0
        ? `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R} L ${cx - 0.01} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`
        : `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R} L ${cx} ${cy} Z`;
    }
    if (r <= 0) return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} Z`;
    const ix1 = cx + r * Math.cos(startAngle), iy1 = cy + r * Math.sin(startAngle);
    const ix2 = cx + r * Math.cos(endAngle),   iy2 = cy + r * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${lg} 0 ${ix1} ${iy1} Z`;
  }

  /** Décale visuellement une part de camembert survolée (effet "exploded slice"). */
  segmentTransform(midAngle: number, active: boolean): string {
    if (!active) return 'translate(0px, 0px)';
    return `translate(${(5 * Math.cos(midAngle)).toFixed(2)}px, ${(5 * Math.sin(midAngle)).toFixed(2)}px)`;
  }

  /* ── Taux de closing (ring gauge) ── */
  winRate = computed(() => {
    const deals = this.allDeals();
    const closed = deals.filter(d => d.stage === 'GAGNE' || d.stage === 'PERDU').length;
    if (!closed) return 0;
    return Math.round((deals.filter(d => d.stage === 'GAGNE').length / closed) * 100);
  });

  winRingDash = computed(() => {
    const circ = 2 * Math.PI * 30; // r=30 → 188.5
    return (this.winRate() / 100) * circ;
  });

  /* ── Anneau des issues de deals — vert (gagné) / rouge (perdu) / violet (en cours) ── */
  dealOutcomeRing = computed(() => {
    const deals = this.allDeals();
    if (!deals.length) return [];
    const t = this.t().gauge;
    const buckets = [
      { key: 'won',  label: t.won,        color: SUCCESS,          count: deals.filter(d => d.stage === 'GAGNE').length },
      { key: 'lost', label: t.lost,       color: DANGER,           count: deals.filter(d => d.stage === 'PERDU').length },
      { key: 'open', label: t.inProgress, color: VIOLET_SHADES[3], count: deals.filter(d => d.stage !== 'GAGNE' && d.stage !== 'PERDU').length },
    ].filter(b => b.count > 0);
    const total = buckets.reduce((a, b) => a + b.count, 0);
    if (!total) return [];
    let a = -Math.PI / 2;
    return buckets.map((b, i) => {
      const frac = b.count / total;
      const sweep = frac * 2 * Math.PI;
      const ea = a + sweep;
      const midAngle = a + sweep / 2;
      const path = this.arcSlicePath(60, 60, 50, 34, a, ea, frac);
      a = ea;
      return { ...b, percentage: Math.round(frac * 100), path, midAngle, index: i };
    });
  });

  /* ── Activity type counts — neutre + accent, plus de trio violet/amber/vert ── */
  activityCounts = computed(() => {
    const acts = this.recentActivites();
    const t = this.t().activityType;
    return [
      { label: t.tasks,  color: ACCENT,  count: acts.filter(a => a.type === 'TACHE').length },
      { label: t.notes,  color: INK_500, count: acts.filter(a => a.type === 'NOTE').length },
      { label: t.system, color: SUCCESS, count: acts.filter(a => a.type === 'SYSTEME').length },
    ];
  });

  /* ── Fil d'activités groupé par jour (Aujourd'hui / Hier / date) — évite la liste plate ── */
  activityTimeline = computed<TimelineGroup[]>(() => {
    const acts = this.recentActivites();
    const tt = this.t().time;
    const now = new Date();
    const todayKey = now.toDateString();
    const yesterdayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();
    const lang = this.langSvc.lang() === 'ar' ? 'ar-MA' : this.langSvc.lang();
    const groups: TimelineGroup[] = [];
    acts.forEach(a => {
      const d = new Date(a.dateCreation);
      const valid = !isNaN(d.getTime());
      const key = valid ? d.toDateString() : 'unknown';
      let group = groups.find(g => g.key === key);
      if (!group) {
        const label = !valid ? tt.today
          : key === todayKey ? tt.today
          : key === yesterdayKey ? tt.yesterday
          : d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
        group = { key, label, items: [] };
        groups.push(group);
      }
      group.items.push(a);
    });
    return groups;
  });

  /* ── Heatmap jour × heure — intensité de l'activité (toutes activités, pas seulement les 8 récentes) ── */
  activityHeatmap = computed(() => {
    const acts = this.allActivites();
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    acts.forEach(a => {
      if (!a.dateCreation) return;
      const d = new Date(a.dateCreation);
      if (isNaN(d.getTime())) return;
      const day = (d.getDay() + 6) % 7; // Lundi = 0 … Dimanche = 6
      grid[day][d.getHours()]++;
    });
    const max = Math.max(...grid.map(row => Math.max(...row)), 1);
    return { grid, max, total: acts.length };
  });

  heatColor(count: number, max: number): string {
    if (!count) return '#F1F5F9';
    const t = count / max;
    const idx = Math.round((1 - t) * (VIOLET_SHADES.length - 1));
    return VIOLET_SHADES[idx];
  }

  /* ── Fenêtre glissante passée (du plus ancien au plus récent) ── */
  private monthBuckets = computed(() => {
    const labels = this.t().monthsShort;
    const now = new Date();
    const n = this.trendMonths();
    const buckets: { year: number; month: number; label: string }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: labels[d.getMonth()] });
    }
    return buckets;
  });

  /* ── Fenêtre glissante future (prévision) — même largeur que la fenêtre passée ── */
  private futureMonthBuckets = computed(() => {
    const labels = this.t().monthsShort;
    const now = new Date();
    const n = this.trendMonths();
    const buckets: { year: number; month: number; label: string }[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: labels[d.getMonth()] });
    }
    return buckets;
  });

  private inBucket(dateStr: string | undefined, year: number, month: number): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === month;
  }

  /** Positionne des valeurs sur l'axe X en fonction du nombre de points. */
  private xFor(index: number, count: number): number {
    if (count <= 1) return CHART_W / 2;
    return PAD_X + (index * (CHART_W - PAD_X * 2)) / (count - 1);
  }

  /* ── Courbe : nouveaux contacts par mois ── */
  newContactsTrend = computed<TrendPoint[]>(() => {
    const buckets = this.monthBuckets();
    const contacts = this.allContacts();
    const counts = buckets.map(b => contacts.filter(c => this.inBucket(c.creatAt, b.year, b.month)).length);
    const max = Math.max(...counts, 1);
    return buckets.map((b, i) => ({
      label: b.label,
      value: counts[i],
      x: this.xFor(i, buckets.length),
      y: PAD_TOP + (BASELINE - PAD_TOP) * (1 - counts[i] / max),
    }));
  });

  contactsLinePath = computed(() => this.smoothPath(this.newContactsTrend()));
  contactsAreaPath = computed(() => this.areaPath(this.newContactsTrend()));
  contactsTotal    = computed(() => this.newContactsTrend().reduce((s, p) => s + p.value, 0));

  /* ── Aire : valeur du pipeline actif (hors deals perdus) par mois de création ── */
  pipelineTrend = computed<TrendPoint[]>(() => {
    const buckets = this.monthBuckets();
    const deals = this.allDeals().filter(d => d.stage !== 'PERDU');
    const totals = buckets.map(b => deals
      .filter(d => this.inBucket(d.createdAt, b.year, b.month))
      .reduce((s, d) => s + (d.montant ?? 0), 0));
    const max = Math.max(...totals, 1);
    return buckets.map((b, i) => ({
      label: b.label,
      value: totals[i],
      x: this.xFor(i, buckets.length),
      y: PAD_TOP + (BASELINE - PAD_TOP) * (1 - totals[i] / max),
    }));
  });

  pipelineLinePath = computed(() => this.smoothPath(this.pipelineTrend()));
  pipelineAreaPath = computed(() => this.areaPath(this.pipelineTrend()));
  pipelineTrendTotal = computed(() => this.pipelineTrend().reduce((s, p) => s + p.value, 0));

  /* ── Prévision pipeline pondérée — montant × probabilité, par mois de clôture estimée ── */
  pipelineForecastTrend = computed<TrendPoint[]>(() => {
    const buckets = this.futureMonthBuckets();
    const deals = this.allDeals().filter(d => d.stage !== 'GAGNE' && d.stage !== 'PERDU');
    const totals = buckets.map(b => deals
      .filter(d => this.inBucket(d.dateClotureEstimee, b.year, b.month))
      .reduce((s, d) => s + (d.montant ?? 0) * ((d.probabilite ?? 0) / 100), 0));
    const max = Math.max(...totals, 1);
    return buckets.map((b, i) => ({
      label: b.label,
      value: totals[i],
      x: this.xFor(i, buckets.length),
      y: PAD_TOP + (BASELINE - PAD_TOP) * (1 - totals[i] / max),
    }));
  });

  forecastLinePath  = computed(() => this.smoothPath(this.pipelineForecastTrend()));
  forecastAreaPath  = computed(() => this.areaPath(this.pipelineForecastTrend()));
  forecastTotal     = computed(() => this.pipelineForecastTrend().reduce((s, p) => s + p.value, 0));

  /* ── Histogramme : deals gagnés vs perdus par mois (date de clôture réelle) ── */
  wonLostTrend = computed<WonLostBar[]>(() => {
    const buckets = this.monthBuckets();
    const deals = this.allDeals();
    const groupW = (CHART_W - PAD_X * 2) / buckets.length;
    const barW = Math.min(14, groupW * 0.32);
    const gap = 3;

    const raw = buckets.map(b => ({
      won:  deals.filter(d => d.stage === 'GAGNE' && this.inBucket(d.dateCloture, b.year, b.month)).length,
      lost: deals.filter(d => d.stage === 'PERDU' && this.inBucket(d.dateCloture, b.year, b.month)).length,
    }));
    const max = Math.max(...raw.map(r => Math.max(r.won, r.lost)), 1);
    const scale = (v: number) => (v / max) * (BASELINE - PAD_TOP);

    return buckets.map((b, i) => {
      const groupCenter = PAD_X + groupW * (i + 0.5);
      const hWon  = scale(raw[i].won);
      const hLost = scale(raw[i].lost);
      return {
        label: b.label, won: raw[i].won, lost: raw[i].lost,
        xWon:  groupCenter - gap / 2 - barW,
        xLost: groupCenter + gap / 2,
        yWon:  BASELINE - hWon,
        yLost: BASELINE - hLost,
        hWon, hLost, barW,
      };
    });
  });

  wonTotalPeriod  = computed(() => this.wonLostTrend().reduce((s, p) => s + p.won, 0));
  lostTotalPeriod = computed(() => this.wonLostTrend().reduce((s, p) => s + p.lost, 0));

  /** Courbe lissée (spline Catmull-Rom → Bézier cubique) au lieu de segments droits. */
  private smoothPath(points: TrendPoint[]): string {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  private areaPath(points: TrendPoint[]): string {
    if (!points.length) return '';
    const line = this.smoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x.toFixed(1)} ${BASELINE} L ${first.x.toFixed(1)} ${BASELINE} Z`;
  }

  /* ── Tooltips interactifs ── */

  showPointTip(chartId: string, index: number, p: TrendPoint, label: string, color: string, formattedValue: string) {
    this.tip.set({
      chartId, pointIndex: index,
      xPct: (p.x / CHART_W) * 100, yPct: (p.y / CHART_H) * 100,
      title: p.label,
      lines: [{ label, value: formattedValue, color }],
    });
  }

  showBarTip(index: number, bar: WonLostBar) {
    const tt = this.t().trends;
    const topY = Math.min(bar.yWon, bar.yLost);
    const centerX = (bar.xWon + bar.xLost + bar.barW) / 2;
    this.tip.set({
      chartId: 'wonlost', pointIndex: index,
      xPct: (centerX / CHART_W) * 100, yPct: (topY / CHART_H) * 100,
      title: bar.label,
      lines: [
        { label: tt.legendWon, value: String(bar.won), color: SUCCESS },
        { label: tt.legendLost, value: String(bar.lost), color: DANGER },
      ],
    });
  }

  showRingTip(chartId: string, index: number, midAngle: number, label: string, color: string, count: number, pct: number) {
    const cx = 60 + 66 * Math.cos(midAngle);
    const cy = 60 + 66 * Math.sin(midAngle);
    this.tip.set({
      chartId, pointIndex: index,
      xPct: (cx / 120) * 100, yPct: (cy / 120) * 100,
      title: label,
      lines: [{ label: `${count} · ${pct}%`, value: '', color }],
    });
  }

  hideTip() { this.tip.set(null); }

  ngOnInit() {
    try { this.username.set(this.keycloak.getUsername() || 'Utilisateur'); }
    catch (e) { this.username.set('Utilisateur'); }
    const h = new Date().getHours();
    this.greetingPeriod.set(h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening');
    this.loadAll();
  }

  private loadAll() {
    this.loading.set(true);
    forkJoin({
      contacts:  this.http.get<any>(`${this.api}/contacts?size=1000`).pipe(catchError(() => of({ content: [], totalElements: 0 }))),
      deals:     this.http.get<any>(`${this.api}/deals?size=1000`).pipe(catchError(() => of({ content: [], totalElements: 0 }))),
      activites: this.http.get<any>(`${this.api}/activites?size=1000`).pipe(catchError(() => of({ content: [] }))),
      campaigns: this.http.get<any>(`${this.api}/campaigns?size=100`).pipe(catchError(() => of({ content: [] })))
    }).subscribe({
      next: ({ contacts, deals, activites, campaigns }) => {
        const contactList: RecentContact[] = contacts.content ?? [];
        this.totalContacts.set(contacts.totalElements ?? contactList.length);
        this.allContacts.set(contactList);
        const totalScore = contactList.reduce((s, c) => s + (c.scoreEngagement ?? 0), 0);
        this.scoresMoyen.set(contactList.length > 0 ? Math.round(totalScore / contactList.length) : 0);

        const dealList: RecentDeal[] = deals.content ?? [];
        this.totalDeals.set(deals.totalElements ?? dealList.length);
        this.allDeals.set(dealList);
        const pipeline = dealList.filter(d => d.stage !== 'PERDU').reduce((s, d) => s + (d.montant ?? 0), 0);
        this.pipelineActif.set(pipeline);
        this.dealsGagnes.set(dealList.filter(d => d.stage === 'GAGNE').length);
        this.dealsPerdu.set(dealList.filter(d => d.stage === 'PERDU').length);
        this.dealsEnCours.set(dealList.filter(d => d.stage !== 'GAGNE' && d.stage !== 'PERDU').length);

        this.allActivites.set(activites.content ?? []);
        const campList: RecentCampaign[] = campaigns.content ?? [];
        this.allCampaigns.set(campList);
        this.campagnesEnvoyees.set(campList.filter((c: any) => c.statut === 'SENT').length);

        this.loading.set(false);
        this.cdr.detectChanges();

        // Laisser le temps au DOM de peindre l'état initial (0%) avant de révéler
        // les graphiques — sans ce délai, les transitions CSS ne se déclenchent pas.
        setTimeout(() => {
          this.revealed.set(true);
          this.runCountUp();
        }, 60);
      },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  /** Anime les valeurs numériques des cartes KPI de 0 vers leur valeur finale. */
  private runCountUp() {
    const duration = 900;
    const start = performance.now();
    const targets = {
      contacts: this.totalContacts(),
      pipeline: this.pipelineActif(),
      gagnes:   this.dealsGagnes(),
      score:    this.scoresMoyen()
    };
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeOutCubic(t);
      this.animContacts.set(targets.contacts * e);
      this.animPipeline.set(targets.pipeline * e);
      this.animGagnes.set(targets.gagnes * e);
      this.animScore.set(targets.score * e);
      this.cdr.detectChanges();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  formatMontant(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M MAD';
    if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K MAD';
    return n + ' MAD';
  }

  stageColor(stage: string): string {
    const map: Record<string, string> = {
      PROSPECT: INK_300, QUALIFICATION: INK_400, PROPOSITION: INK_500,
      NEGOCIATION: ACCENT, GAGNE: SUCCESS, PERDU: DANGER
    };
    return map[stage] ?? INK_400;
  }

  tempsRelatif(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const h   = Math.floor(min / 60);
    const j   = Math.floor(h / 24);
    const time = this.t().time;
    if (j > 0)   return time.daysAgo.replace('{n}', String(j));
    if (h > 0)   return time.hoursAgo.replace('{n}', String(h));
    if (min > 0) return time.minutesAgo.replace('{n}', String(min));
    return time.justNow;
  }

  leadStageLabel(stage: string): string {
    const s = this.t().leadStage;
    const map: Record<string, string> = {
      NOUVEAU: s.new, CONTACTE: s.contacted, CONTACTÉ: s.contacted,
      QUALIFIE: s.qualified, QUALIFIÉ: s.qualified,
      PROPOSITION: s.proposal, CONVERTI: s.converted, PERDU: s.lost
    };
    return map[stage] ?? stage;
  }
}