import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { KeycloakService } from 'keycloak-angular';
import { VisitorTrackingService } from '../../services/visitor-tracking.service';

export const LANG_OPTIONS = [
  { code: 'fr' as const, label: 'FR', flag: '🇫🇷' },
  { code: 'ar' as const, label: 'عر', flag: '🇲🇦' },
  { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
];

export const BRANDS = ['Immobilier', 'Commerce & Retail', 'Services Financiers', 'E-commerce', 'Conseil', 'Tech & Startups'];

export const AI_LEADS_INIT = [
  { name: 'Ahmed Benali', company: 'Société Atlas', score: 94, trend: '+8' },
  { name: 'Fatima Zahra', company: 'Riad Collection', score: 78, trend: '+3' },
  { name: 'Youssef Idrissi', company: 'TechMaroc SARL', score: 61, trend: '-2' },
  { name: 'Nadia Squalli', company: 'Export Casablanca', score: 87, trend: '+12' },
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, OnDestroy {
  langSvc = inject(LanguageService);
  private tracking = inject(VisitorTrackingService);
  t = this.langSvc.t;
  lang = this.langSvc.lang;
  isRtl = this.langSvc.isRtl;

  langOptions = LANG_OPTIONS;
  brands = BRANDS;
  aiLeads = [...AI_LEADS_INIT];

  scrolled = signal(false);
  menuOpen = signal(false);

  private scoreInterval?: ReturnType<typeof setInterval>;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  ngOnInit(): void {
    this.scoreInterval = setInterval(() => {
      this.aiLeads = this.aiLeads.map((lead) => ({
        ...lead,
        score: Math.min(100, Math.max(10, lead.score + Math.floor(Math.random() * 7) - 3)),
      }));
    }, 2000);

    this.tracking.recordPageView();
    this.tracking.startHeartbeat();
  }

  ngOnDestroy(): void {
    if (this.scoreInterval) clearInterval(this.scoreInterval);
    this.tracking.stopHeartbeat();
  }

  setLang(code: 'fr' | 'ar' | 'en'): void {
    this.langSvc.setLang(code);
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  scoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 bg-green-50 border border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border border-amber-200';
    return 'text-red-600 bg-red-50 border border-red-200';
  }

  scoreBarColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-400';
  }

  trackByIndex(index: number): number {
    return index;
  }

  constructor(private keycloak: KeycloakService) {}

  login() {
    this.keycloak.login({
      redirectUri: window.location.origin + '/app/dashboard'
    });
  }
}
