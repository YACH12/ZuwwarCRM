import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { ClientService } from '../../services/client.service';
import { KeycloakService } from 'keycloak-angular';
import { VisitorTrackingService } from '../../services/visitor-tracking.service';

const LANG_OPTIONS = [
  { code: 'fr' as const, label: 'FR', flag: '🇫🇷' },
  { code: 'ar' as const, label: 'عر', flag: '🇲🇦' },
  { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
];

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit, OnDestroy {
  private router    = inject(Router);
  private keycloak  = inject(KeycloakService);
  private clientSvc = inject(ClientService);
  private tracking  = inject(VisitorTrackingService);
  langSvc = inject(LanguageService);
  st      = this.langSvc.st;
  lang    = this.langSvc.lang;
  isRtl   = this.langSvc.isRtl;

  langOptions = LANG_OPTIONS;

  // ── Plan sélectionné ────────────────────────────────────────────────────────
  selectedPlanId = signal<string>('free-tier');

  plans = [
    { id: 'free-tier',    code: 'FREE',    nom: ' Gratuit',  prix: '0 MAD/mois' },
    { id: 'demo-tier',    code: 'DEMO',    nom: ' Démo',     prix: '29 MAD/mois' },
    { id: 'premium-tier', code: 'PREMIUM', nom: ' Premium',  prix: '99 MAD/mois' },
  ];

  // ── Formulaire ──────────────────────────────────────────────────────────────
  form = {
    firstName:  '',
    lastName:   '',
    email:      '',
    password:   '',
    company:    '',
    occupation: '',
    phone:      '',
    country:    'Maroc',
    terms:      false,
  };

  errors: Record<string, string> = {};
  showPassword = false;
  loading   = signal(false);
  submitted = signal(false);
  errorMsg  = signal('');

  // ── Force du mot de passe ───────────────────────────────────────────────────
  passwordStrength = computed(() => {
    const pwd = this.form.password;
    if (!pwd) return -1;
    if (pwd.length < 6) return 0;
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  });

  strengthColors     = ['bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-emerald-500'];
  strengthTextColors = ['text-red-500','text-orange-500','text-yellow-500','text-green-600','text-emerald-600'];

  // ── Méthodes ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.tracking.recordPageView();
    this.tracking.startHeartbeat();
  }

  ngOnDestroy(): void {
    this.tracking.stopHeartbeat();
  }

  setLang(code: 'fr' | 'ar' | 'en'): void {
    this.langSvc.setLang(code);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  selectPlan(planId: string): void {
    this.selectedPlanId.set(planId);
  }

  validate(): boolean {
    this.errors = {};
    if (!this.form.firstName.trim()) this.errors['firstName'] = '✕';
    if (!this.form.lastName.trim())  this.errors['lastName']  = '✕';
    if (!this.form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) this.errors['email'] = '✕';
    if (this.form.password.length < 8) this.errors['password'] = '✕';
    if (!this.form.company.trim()) this.errors['company'] = '✕';
    if (!this.form.country)        this.errors['country'] = '✕';
    if (!this.form.terms)          this.errors['terms']   = '✕';
    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const clientData = {
      nom:           this.form.lastName,
      prenom:        this.form.firstName,
      email:         this.form.email,
      password:      this.form.password,
      telephone:     this.form.phone,
      nomEntreprise: this.form.company,
      pays:          this.form.country,
      occupation:    this.form.occupation,
      visitorId:     this.tracking.getVisitorId(),
    };

    this.clientSvc.inscrire(clientData, this.selectedPlanId()).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        // Connexion automatique après inscription
        setTimeout(() => {
          this.keycloak.login({ redirectUri: window.location.origin + '/app/dashboard' });
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.error || 'Erreur lors de l\'inscription. Réessayez.');
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  trackByIndex(index: number): number {
    return index;
  }

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin + '/app/dashboard'
    });
  }
}