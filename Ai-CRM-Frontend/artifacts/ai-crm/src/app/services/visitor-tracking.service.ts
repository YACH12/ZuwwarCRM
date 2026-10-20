import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const VISITOR_ID_KEY = 'crm_visitor_id';
const SESSION_KEY = 'crm_visitor_session_active';
const UTM_SOURCE_KEY = 'crm_utm_source';
const UTM_CAMPAIGN_KEY = 'crm_utm_campaign';
const HEARTBEAT_INTERVAL_MS = 15000;

/**
 * Suit le comportement d'un visiteur anonyme (landing/signup) avant son
 * inscription — temps passé, pages vues, nouvelle visite — pour alimenter
 * le scoring IA du client une fois créé. Les données sont envoyées au
 * backend par petits paquets (heartbeat) plutôt qu'en une fois, pour
 * survivre si le visiteur ferme l'onglet sans finir son inscription.
 */
@Injectable({ providedIn: 'root' })
export class VisitorTrackingService {
  private readonly visitorId: string;
  private isNewVisit = false;
  private pendingPageViews = 0;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private lastTick = Date.now();

  constructor(private http: HttpClient) {
    this.visitorId = this.getOrCreateVisitorId();
    this.captureUtmFromUrl();
    this.isNewVisit = !sessionStorage.getItem(SESSION_KEY);
    if (this.isNewVisit) sessionStorage.setItem(SESSION_KEY, '1');

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stopHeartbeat();
      else this.startHeartbeat();
    });
    window.addEventListener('beforeunload', () => this.tick());
  }

  getVisitorId(): string {
    return this.visitorId;
  }

  recordPageView(): void {
    this.pendingPageViews++;
  }

  startHeartbeat(): void {
    if (this.intervalHandle || document.hidden) return;
    this.lastTick = Date.now();
    this.intervalHandle = setInterval(() => this.tick(), HEARTBEAT_INTERVAL_MS);
  }

  stopHeartbeat(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.tick();
  }

  private getOrCreateVisitorId(): string {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = (crypto as any).randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  }

  private captureUtmFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const campaign = params.get('utm_campaign');
    if (source) localStorage.setItem(UTM_SOURCE_KEY, source);
    if (campaign) localStorage.setItem(UTM_CAMPAIGN_KEY, campaign);
  }

  private tick(): void {
    const now = Date.now();
    const deltaSeconds = (now - this.lastTick) / 1000;
    this.lastTick = now;

    if (deltaSeconds < 1 && this.pendingPageViews === 0 && !this.isNewVisit) return;

    const body = {
      visitorId: this.visitorId,
      deltaSeconds,
      deltaPageViews: this.pendingPageViews,
      newVisit: this.isNewVisit,
      utmSource: localStorage.getItem(UTM_SOURCE_KEY) || undefined,
      utmCampaign: localStorage.getItem(UTM_CAMPAIGN_KEY) || undefined,
    };
    this.pendingPageViews = 0;
    this.isNewVisit = false;

    this.http.post('/api/tracking/visitor/heartbeat', body).subscribe({ error: () => {} });
  }
}
