import { Injectable, Signal, signal, computed, effect } from '@angular/core';
import { translations, signupTranslations } from '../shared/translations';
import type { Lang } from '../shared/translations';

const STORAGE_KEY = 'zuwwar_lang';

function readStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'fr' || stored === 'en' || stored === 'ar' ? stored : 'fr';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Lang>(readStoredLang());
  readonly t = computed(() => translations[this.lang()]);
  readonly st = computed(() => signupTranslations[this.lang()]);
  readonly isRtl = computed(() => this.t().dir === 'rtl');

  constructor() {
    effect(() => {
      const dir = this.t().dir;
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', this.lang());
    });
  }

  setLang(l: Lang): void {
    this.lang.set(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  /** Construit un signal de traduction pour un nouveau dictionnaire {fr,en,ar}, en suivant la langue courante. */
  select<T>(dict: Record<Lang, T>): Signal<T> {
    return computed(() => dict[this.lang()]);
  }
}
