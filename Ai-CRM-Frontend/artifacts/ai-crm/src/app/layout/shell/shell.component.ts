import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChatbotComponent } from '../../pages/chatbot/chatbot.component';
import { LanguageService } from '../../services/language.service';
import { ProfileService } from '../../services/profile.service';
import { AvatarService } from '../../services/avatar.service';
import { NotificationService, NotificationItem, NotificationKind } from '../../services/notification.service';
import { GlobalSearchService, GlobalSearchResults } from '../../services/global-search.service';
import { shellTranslations } from '../../shared/i18n/shell.i18n';
import type { Lang } from '../../shared/translations';

const NOTIF_LAST_SEEN_KEY = 'crm_notif_last_seen_at';

const NOTIF_ICONS: Record<NotificationKind, { icon: string; bg: string; color: string }> = {
  contact:   { icon: '👤', bg: '#EDE9FE', color: '#7C3AED' },
  deal_won:  { icon: '🏆', bg: '#ECFDF5', color: '#16A34A' },
  deal_lost: { icon: '⚠️', bg: '#FEF2F2', color: '#DC2626' },
  deal_new:  { icon: '💼', bg: '#F5F3FF', color: '#7C3AED' },
  campaign:  { icon: '📣', bg: '#FFFBEB', color: '#D97706' },
};

interface CrmUser {
  id: number | null;
  email: string;
  name: string;
  role: string;
  initials: string;
  photoUrl?: string;
  // undefined pour le staff (jamais limité par un plan) — présent uniquement pour un compte CLIENT
  chatbotAccess?: boolean;
  smtpPersonnalise?: boolean;
}

const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ar', label: 'عر', flag: '🇲🇦' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, ChatbotComponent],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Les tokens (--ink-900, --accent, --surface, etc.) viennent de :root dans
       styles.css — plus de redéfinition locale ici, pour éviter la dérive de
       couleur (l'accent indigo local ne correspondait plus au violet utilisé
       par le reste de l'app : dashboard, deals, contacts...). */

    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--canvas);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink-900);
    }

    .sidebar {
      width: 248px;
      background: var(--surface);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid var(--line);
      transition: width 0.2s ease;
      overflow: hidden;
      white-space: nowrap;
      z-index: 10;
    }

    .sidebar.collapsed { width: 68px; }

    .sidebar-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--line);
      transition: padding 0.2s;
      flex-shrink: 0;
    }

    .sidebar.collapsed .sidebar-header {
      justify-content: center;
      padding: 0;
    }

    .brand-logo { height: 22px; width: auto; }
    .sidebar.collapsed .brand-logo { display: none; }

    .collapse-btn {
      background: none;
      border: 1px solid transparent;
      color: var(--ink-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px; height: 26px;
      border-radius: 6px;
      transition: all 0.15s;
      flex-shrink: 0;
    }

    .collapse-btn:hover { background: var(--line-soft); border-color: var(--line); color: var(--ink-700); }

    .sidebar-nav {
      flex: 1;
      padding: 6px 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-nav::-webkit-scrollbar { width: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }

    .nav-section-label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      color: var(--ink-400);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0 16px;
      margin: 16px 0 4px;
      transition: opacity 0.2s;
    }

    .sidebar.collapsed .nav-section-label {
      opacity: 0; height: 0; margin: 0; overflow: hidden;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 1px 8px;
      padding: 7px 10px;
      border-radius: 6px;
      color: var(--ink-500);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
      text-decoration: none;
      cursor: pointer;
    }

    .nav-link:hover { background: var(--line-soft); color: var(--ink-900); }
    .nav-link:hover .nav-icon { color: var(--ink-700); }

    .nav-link.active {
      background: var(--accent-soft);
      color: var(--accent-soft-ink);
      font-weight: 600;
    }
    .nav-link.active .nav-icon { color: var(--accent); }

    .nav-icon {
      width: 17px; height: 17px;
      flex-shrink: 0;
      color: var(--ink-400);
      transition: color 0.15s;
    }

    .link-text { flex: 1; transition: opacity 0.2s; }

    .nav-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--line);
      color: var(--ink-500);
      background: var(--surface);
    }

    .sidebar.collapsed .nav-link { margin: 1px 10px; padding: 9px 0; justify-content: center; }
    .sidebar.collapsed .link-text,
    .sidebar.collapsed .nav-badge { display: none; }

    .sidebar-footer {
      padding: 12px 14px;
      border-top: 1px solid var(--line);
      transition: padding 0.2s;
    }

    .sidebar.collapsed .sidebar-footer { padding: 12px 0; display: flex; justify-content: center; }

    .user-info { display: flex; align-items: center; gap: 9px; width: 100%; cursor: pointer; }
    .sidebar.collapsed .user-info { justify-content: center; }

    .avatar {
      width: 32px; height: 32px;
      border-radius: 7px;
      object-fit: cover;
      flex-shrink: 0;
      background: var(--ink-900);
      cursor: pointer;
    }

    .user-meta { flex: 1; min-width: 0; line-height: 1.3; }
    .sidebar.collapsed .user-meta,
    .sidebar.collapsed .logout-btn { display: none; }

    .user-name {
      color: var(--ink-900);
      font-size: 12.5px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: block;
      font-size: 10.5px;
      color: var(--ink-400);
      margin-top: 1px;
      text-transform: capitalize;
    }

    .logout-btn {
      width: 26px; height: 26px; border-radius: 6px;
      background: none; border: none; color: var(--ink-300);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .logout-btn:hover { color: var(--danger); background: #FEF2F2; }

    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--line);
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      gap: 16px;
    }

    .topbar-search {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--canvas);
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 7px 12px;
      width: 300px;
      transition: all 0.15s;
    }

    .topbar-search:focus-within {
      background: var(--surface);
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
    }

    .topbar-search input {
      border: none; background: none; outline: none;
      font-size: 13px; color: var(--ink-900); width: 100%;
      font-family: 'Inter', sans-serif;
    }
    .topbar-search input::placeholder { color: var(--ink-400); }

    /* ── Menu déroulant de recherche globale ─────────────────────── */
    .search-dropdown {
      position: absolute; top: calc(100% + 8px); left: 0;
      width: 380px; max-height: 440px; overflow-y: auto;
      background: var(--surface); border: 1px solid var(--line);
      border-radius: 14px; box-shadow: 0 12px 32px rgba(15,23,42,0.14);
      z-index: 250;
    }
    .search-backdrop { position: fixed; inset: 0; z-index: 240; background: transparent; }

    .search-group { padding: 8px 6px; }
    .search-group + .search-group { border-top: 1px solid var(--line-soft); }
    .search-group-label {
      font-size: 10.5px; font-weight: 700; color: var(--ink-400);
      text-transform: uppercase; letter-spacing: 0.06em;
      padding: 6px 10px 4px;
    }
    .search-result-item {
      display: flex; flex-direction: column; gap: 1px;
      padding: 8px 10px; border-radius: 10px; cursor: pointer;
      transition: background 0.12s;
    }
    .search-result-item:hover { background: var(--canvas); }
    .search-result-title { font-size: 13px; font-weight: 600; color: var(--ink-900); }
    .search-result-sub { font-size: 11.5px; color: var(--ink-400); }

    .search-empty, .search-loading, .search-hint {
      padding: 28px 16px; text-align: center; font-size: 12.5px; color: var(--ink-400);
    }

    .topbar-right { display: flex; align-items: center; gap: 4px; }

    .notif-wrap { position: relative; }

    .notif-btn {
      width: 34px; height: 34px; border-radius: 7px;
      background: transparent; border: none;
      display: flex; align-items: center; justify-content: center;
      color: var(--ink-400); position: relative;
      cursor: pointer; transition: all 0.15s;
    }
    .notif-btn:hover { background: var(--line-soft); color: var(--ink-700); }

    .notif-dot {
      position: absolute; top: 7px; right: 7px;
      width: 7px; height: 7px;
      background: var(--danger);
      border-radius: 50%;
      border: 2px solid var(--surface);
    }

    .notif-backdrop { position: fixed; inset: 0; z-index: 240; background: transparent; }

    .notif-panel {
      position: absolute; top: calc(100% + 10px); right: 0;
      width: 340px; max-height: 420px; overflow-y: auto;
      background: var(--surface); border: 1px solid var(--line);
      border-radius: 14px; box-shadow: 0 12px 32px rgba(15,23,42,0.14);
      z-index: 250;
    }
    .notif-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--line-soft);
      position: sticky; top: 0; background: var(--surface);
    }
    .notif-panel-title { font-size: 13.5px; font-weight: 700; color: var(--ink-900); }
    .notif-mark-read {
      border: none; background: none; color: var(--accent);
      font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;
    }
    .notif-mark-read:hover { text-decoration: underline; }
    .notif-list { padding: 6px; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 9px 10px; border-radius: 10px; transition: background 0.15s;
    }
    .notif-item:hover { background: var(--canvas); }
    .notif-item-icon {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 14px;
    }
    .notif-item-body { min-width: 0; flex: 1; }
    .notif-item-title { font-size: 12.5px; font-weight: 600; color: var(--ink-900); }
    .notif-item-subtitle {
      font-size: 12px; color: var(--ink-500); margin-top: 1px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .notif-item-time { font-size: 11px; color: var(--ink-400); margin-top: 2px; }
    .notif-empty {
      padding: 32px 16px; text-align: center; font-size: 12.5px; color: var(--ink-400);
    }

    .topbar-divider { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }

    .lang-switch {
      display: flex; align-items: center; gap: 2px;
      background: var(--canvas); border-radius: 7px; padding: 3px;
    }
    .lang-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 5px 9px; border-radius: 5px; border: none;
      background: transparent; color: var(--ink-500);
      font-size: 11px; font-weight: 700; cursor: pointer;
      font-family: 'Inter', sans-serif; transition: all 0.15s;
    }
    .lang-btn:hover { color: var(--ink-900); }
    .lang-btn.active { background: var(--surface); color: var(--accent-soft-ink); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

    .topbar-user {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 8px 4px 4px;
      border-radius: 7px; cursor: pointer;
      transition: background 0.15s; border: none; background: none;
    }
    .topbar-user:hover { background: var(--line-soft); }

    .topbar-avatar {
      width: 30px; height: 30px; border-radius: 7px;
      object-fit: cover;
      background: var(--ink-900); flex-shrink: 0;
    }

    .topbar-user-info { text-align: left; }
    .topbar-user-name { font-size: 12.5px; font-weight: 600; color: var(--ink-900); line-height: 1.2; }
    .topbar-user-role { font-size: 10.5px; color: var(--ink-400); text-transform: capitalize; }

    .content { flex: 1; overflow-y: auto; padding: 24px 28px; background: var(--canvas); }

    /* ── Profile modal ─────────────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,0.45);
      z-index: 200; display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    }
    .profile-modal {
      background: var(--surface); border-radius: 18px; padding: 28px;
      width: 380px; max-width: 90vw;
      box-shadow: 0 24px 64px rgba(15,23,42,0.2);
    }
    .profile-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .profile-modal-title { font-size: 17px; font-weight: 700; color: var(--ink-900); }
    .profile-modal-close {
      width: 30px; height: 30px; border-radius: 8px; background: var(--line-soft);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--ink-500); font-size: 16px;
    }
    .profile-modal-close:hover { background: var(--line); }
    .profile-avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 22px; }
    .profile-avatar-img-wrap { position: relative; width: 84px; height: 84px; cursor: pointer; }
    .profile-avatar-img {
      width: 84px; height: 84px; border-radius: 50%;
      object-fit: cover; background: var(--line-soft);
    }
    .profile-avatar-edit-badge {
      position: absolute; inset: 0; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,23,42,0.55); color: white; font-size: 20px;
      opacity: 0; transition: opacity 0.15s;
    }
    .profile-avatar-img-wrap:hover .profile-avatar-edit-badge { opacity: 1; }
    .profile-avatar-change-label { font-size: 12px; color: var(--accent); font-weight: 600; cursor: pointer; }
    .profile-field { margin-bottom: 14px; }
    .profile-field-label { font-size: 11px; font-weight: 600; color: var(--ink-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .profile-field-value { font-size: 14px; color: var(--ink-900); font-weight: 500; }
    .profile-error { font-size: 12.5px; color: var(--danger); margin-top: 10px; text-align: center; }

    /* ── Splash de transition login → dashboard : deux battants qui s'ouvrent
       comme une porte, révélant le logo Zuwwar (« les visiteurs ») ── */
    .splash-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--canvas);
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    .splash-overlay.fading { opacity: 0; }

    .splash-door {
      position: absolute;
      top: 0; bottom: 0;
      width: 50%;
      background: linear-gradient(135deg, #6D28D9 0%, var(--accent) 100%);
      z-index: 2;
      transition: transform 0.85s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .splash-door-left  { left: 0;  transform: translateX(0);    border-right: 1px solid rgba(255,255,255,.18); }
    .splash-door-right { right: 0; transform: translateX(0);    border-left:  1px solid rgba(255,255,255,.18); }
    .splash-door-left.open  { transform: translateX(-100%); }
    .splash-door-right.open { transform: translateX(100%); }

    .splash-logo {
      position: relative;
      z-index: 1;
      width: 180px;
      height: auto;
      opacity: 0;
      animation: splash-logo-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .splash-logo.entry-delay { animation-delay: 0.45s; }
    @keyframes splash-logo-in {
      0%   { opacity: 0; transform: scale(0.6); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* ── Responsive : l'app était desktop-only (sidebar 248px fixe, aucun
       @media). En dessous de 900px, la sidebar bascule en rail d'icônes
       (comme .collapsed) et la recherche se réduit pour laisser la place. ── */
    @media (max-width: 900px) {
      .sidebar { width: 68px; }
      .sidebar .sidebar-header { justify-content: center; padding: 0; }
      .sidebar .brand-logo { display: none; }
      .sidebar .nav-section-label { opacity: 0; height: 0; margin: 0; overflow: hidden; }
      .sidebar .nav-link { margin: 1px 10px; padding: 9px 0; justify-content: center; }
      .sidebar .link-text, .sidebar .nav-badge { display: none; }
      .sidebar .sidebar-footer { padding: 12px 0; display: flex; justify-content: center; }
      .sidebar .user-meta, .sidebar .logout-btn { display: none; }
      .topbar-search { width: 160px; }
      .topbar-search input::placeholder { font-size: 12px; }
    }
    @media (max-width: 600px) {
      .topbar-search { display: none; }
      .content { padding: 16px; }
    }
  `],
  template: `
    <div class="shell">

      <aside class="sidebar" [class.collapsed]="!isSidebarExpanded()">

        <div class="sidebar-header">
          <img src="logo.png" alt="CRM" class="brand-logo" />
          <button class="collapse-btn" (click)="toggleSidebar()" [title]="t().sidebar.toggleSidebar">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" *ngIf="isSidebarExpanded()"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"   *ngIf="!isSidebarExpanded()"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <span class="nav-section-label">{{ t().sidebar.sectionMain }}</span>

          <a class="nav-link" routerLink="/app/dashboard" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            <span class="link-text">{{ t().sidebar.overview }}</span>
          </a>

          <a class="nav-link" routerLink="/app/contacts" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="link-text">{{ t().sidebar.contacts }}</span>
          </a>

          @if (hasMailboxAccess()) {
            <a class="nav-link" routerLink="/app/mailbox" routerLinkActive="active">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="link-text">{{ t().sidebar.mailbox }}</span>
            </a>
          }

          <a class="nav-link" routerLink="/app/deals" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span class="link-text">{{ t().sidebar.deals }}</span>
          </a>

          <a class="nav-link" routerLink="/app/activities" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span class="link-text">{{ t().sidebar.activities }}</span>
          </a>

          <a class="nav-link" routerLink="/app/campaigns" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
            </svg>
            <span class="link-text">{{ t().sidebar.campaigns }}</span>
            <span class="nav-badge">{{ t().sidebar.campaignsNew }}</span>
          </a>

          @if (hasChatbotAccess()) {
            <a class="nav-link" [class.active]="chatbotOpen()" (click)="toggleChatbot()">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span class="link-text">{{ t().sidebar.chatbot }}</span>
            </a>
          }

          <span class="nav-section-label" style="margin-top:18px">{{ t().sidebar.sectionSystem }}</span>

          @if (user()?.role === 'Admin' || user()?.role === 'Manager') {
            <a class="nav-link" routerLink="/app/clients" routerLinkActive="active">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="link-text">{{ t().sidebar.clients }}</span>
            </a>
          }
          @if (user()?.role === 'Admin') {
            <a class="nav-link" routerLink="/app/users" routerLinkActive="active">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span class="link-text">{{ t().sidebar.users }}</span>
            </a>
          }

          <a class="nav-link" routerLink="/app/settings" routerLinkActive="active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="link-text">{{ t().sidebar.settings }}</span>
          </a>

        </nav>

        <div class="sidebar-footer">
          <div class="user-info" (click)="openProfileModal()">
            <img class="avatar" [src]="avatarUrl()" [alt]="user()?.name || ''" />
            <div class="user-meta">
              <div class="user-name">{{ user()?.name || 'Admin' }}</div>
              <span class="role-badge">{{ roleLabel(user()?.role) }}</span>
            </div>
            <button class="logout-btn" (click)="logout(); $event.stopPropagation()" [title]="t().sidebar.logout">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div class="main">

        <header class="topbar">
          <div class="topbar-search">
            <svg width="15" height="15" fill="none" stroke="#94A3B8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [placeholder]="t().topbar.searchPlaceholder"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchInput($event)"
              (focus)="onSearchFocus()"
              (click)="$event.stopPropagation()"
            />

            @if (searchOpen()) {
              <div class="search-backdrop" (click)="closeSearch()"></div>
              <div class="search-dropdown" (click)="$event.stopPropagation()">

                @if (searching()) {
                  <div class="search-loading">Recherche…</div>
                } @else if (searchQuery().trim().length < 2) {
                  <div class="search-hint">Tapez au moins 2 caractères…</div>
                } @else if (hasAnyResult()) {

                  @if (searchResults()!.contacts.length) {
                    <div class="search-group">
                      <div class="search-group-label">Contacts</div>
                      @for (c of searchResults()!.contacts; track c.id) {
                        <div class="search-result-item" (click)="goToContact(c.id)">
                          <span class="search-result-title">{{ c.nom }}</span>
                          <span class="search-result-sub">{{ c.email }}</span>
                        </div>
                      }
                    </div>
                  }

                  @if (searchResults()!.deals.length) {
                    <div class="search-group">
                      <div class="search-group-label">Deals</div>
                      @for (d of searchResults()!.deals; track d.id) {
                        <div class="search-result-item" (click)="goToDeal(d.id)">
                          <span class="search-result-title">{{ d.titre }}</span>
                          <span class="search-result-sub">{{ d.montant | number }} — {{ d.stage }}</span>
                        </div>
                      }
                    </div>
                  }

                  @if (searchResults()!.entreprises.length) {
                    <div class="search-group">
                      <div class="search-group-label">Entreprises</div>
                      @for (e of searchResults()!.entreprises; track e.id) {
                        <div class="search-result-item" (click)="goToEntreprise(e.id)">
                          <span class="search-result-title">{{ e.nom }}</span>
                          @if (e.secteur) { <span class="search-result-sub">{{ e.secteur }}</span> }
                        </div>
                      }
                    </div>
                  }

                } @else {
                  <div class="search-empty">Aucun résultat pour « {{ searchQuery() }} »</div>
                }
              </div>
            }
          </div>

          <div class="topbar-right">
            <div class="lang-switch">
              @for (opt of langOptions; track opt.code) {
                <button class="lang-btn" [class.active]="lang() === opt.code" (click)="setLang(opt.code)">
                  <span>{{ opt.flag }}</span><span>{{ opt.label }}</span>
                </button>
              }
            </div>

            <div class="topbar-divider"></div>

            <div class="notif-wrap">
              <button class="notif-btn" [title]="t().topbar.notifications" (click)="toggleNotifications(); $event.stopPropagation()">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (hasUnseen()) { <span class="notif-dot"></span> }
              </button>

              @if (notifOpen()) {
                <div class="notif-backdrop" (click)="closeNotifications()"></div>
                <div class="notif-panel" (click)="$event.stopPropagation()">
                  <div class="notif-panel-header">
                    <span class="notif-panel-title">{{ t().notifications.title }}</span>
                    @if (notifications().length) {
                      <button class="notif-mark-read" (click)="markAllSeen()">{{ t().notifications.markAllRead }}</button>
                    }
                  </div>
                  <div class="notif-list">
                    @for (n of notifications(); track n.id) {
                      <div class="notif-item">
                        <div class="notif-item-icon" [style.background]="notifIconBg(n.kind)" [style.color]="notifIconColor(n.kind)">
                          {{ notifIcon(n.kind) }}
                        </div>
                        <div class="notif-item-body">
                          <div class="notif-item-title">{{ t().notifications.kinds[n.kind] }}</div>
                          <div class="notif-item-subtitle">{{ n.subtitle }}</div>
                          <div class="notif-item-time">{{ relativeTime(n.date) }}</div>
                        </div>
                      </div>
                    }
                    @if (!notifications().length) {
                      <div class="notif-empty">{{ t().notifications.empty }}</div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="topbar-divider"></div>

            <button class="topbar-user" (click)="openProfileModal()">
              <img class="topbar-avatar" [src]="avatarUrl()" [alt]="user()?.name || ''" />
              <div class="topbar-user-info">
                <div class="topbar-user-name">{{ user()?.name || 'Admin' }}</div>
                <div class="topbar-user-role">{{ roleLabel(user()?.role) }}</div>
              </div>
            </button>
          </div>
        </header>

        <div class="content">
          <router-outlet />
        </div>
      </div>

      <app-chatbot #chatbotRef [showFab]="false" />
    </div>

    <input #profilePhotoInput type="file" accept="image/*" style="display:none" (change)="onPhotoFileSelected($event)" />

    @if (showProfileModal()) {
      <div class="modal-overlay" (click)="closeProfileModal()" (keydown.escape)="closeProfileModal()">
        <div class="profile-modal" role="dialog" aria-modal="true" [attr.aria-label]="t().profileModal.title" (click)="$event.stopPropagation()">
          <div class="profile-modal-header">
            <div class="profile-modal-title">{{ t().profileModal.title }}</div>
            <button class="profile-modal-close" [attr.aria-label]="t().profileModal.close" (click)="closeProfileModal()">×</button>
          </div>

          <div class="profile-avatar-wrap">
            <div class="profile-avatar-img-wrap" (click)="startPhotoUpload(profilePhotoInput)">
              <img class="profile-avatar-img" [src]="avatarUrl()" [alt]="user()?.name || ''" />
              <div class="profile-avatar-edit-badge">📷</div>
            </div>
            <span class="profile-avatar-change-label" (click)="startPhotoUpload(profilePhotoInput)">{{ t().profileModal.changePhoto }}</span>
          </div>

          <div class="profile-field">
            <div class="profile-field-label">{{ t().profileModal.name }}</div>
            <div class="profile-field-value">{{ user()?.name || '-' }}</div>
          </div>
          <div class="profile-field">
            <div class="profile-field-label">{{ t().profileModal.email }}</div>
            <div class="profile-field-value">{{ user()?.email || '-' }}</div>
          </div>
          <div class="profile-field">
            <div class="profile-field-label">{{ t().profileModal.role }}</div>
            <div class="profile-field-value">{{ roleLabel(user()?.role) }}</div>
          </div>

          @if (profileError()) {
            <div class="profile-error">{{ profileError() }}</div>
          }
        </div>
      </div>
    }

    @if (showSplash()) {
      <div class="splash-overlay" [class.fading]="splashFading()">
        <div class="splash-door splash-door-left"  [class.open]="doorsOpen()"></div>
        <div class="splash-door splash-door-right" [class.open]="doorsOpen()"></div>
        <img src="zuwwar-logo-transparent.png" alt="Zuwwar" class="splash-logo entry-delay" />
      </div>
    }

    @if (loggingOut()) {
      <div class="splash-overlay">
        <div class="splash-door splash-door-left"  [class.open]="!logoutDoorsClosing()"></div>
        <div class="splash-door splash-door-right" [class.open]="!logoutDoorsClosing()"></div>
        <img src="zuwwar-logo-transparent.png" alt="Zuwwar" class="splash-logo" />
      </div>
    }
  `
})
export class ShellComponent implements OnInit {
  @ViewChild('chatbotRef') chatbotRef?: ChatbotComponent;

  private langSvc = inject(LanguageService);
  private profileSvc = inject(ProfileService);
  private avatarSvc = inject(AvatarService);
  private notifSvc = inject(NotificationService);
  private searchSvc = inject(GlobalSearchService);

  user = signal<CrmUser | null>(null);
  isSidebarExpanded = signal(true);
  showProfileModal = signal(false);
  profileError = signal('');

  // Splash affiché une fois à l'entrée dans l'app (transition login → dashboard)
  showSplash = signal(true);
  doorsOpen = signal(false);
  splashFading = signal(false);

  // Splash inverse au logout : le logo apparaît d'abord, puis la porte se
  // ferme dessus avant la redirection Keycloak.
  loggingOut = signal(false);
  logoutDoorsClosing = signal(false);

  notifications = signal<NotificationItem[]>([]);
  notifOpen = signal(false);
  private lastSeenAt = signal<number>(Number(localStorage.getItem(NOTIF_LAST_SEEN_KEY) || 0));
  hasUnseen = computed(() =>
    this.notifications().some(n => new Date(n.date).getTime() > this.lastSeenAt())
  );

  // ── Recherche globale (navbar) ──────────────────────────────────────
  searchQuery = signal('');
  searchOpen = signal(false);
  searching = signal(false);
  searchResults = signal<GlobalSearchResults | null>(null);
  private searchInput$ = new Subject<string>();

  t = this.langSvc.select(shellTranslations);
  lang = this.langSvc.lang;
  langOptions = LANG_OPTIONS;

  avatarUrl = () => {
    const u = this.user();
    return this.avatarSvc.resolve(u?.photoUrl, u?.email || u?.name || '?');
  };

  constructor(
    private router: Router,
    private keycloak: KeycloakService
  ) {}

  async ngOnInit() {
    setTimeout(() => this.doorsOpen.set(true),    350);
    setTimeout(() => this.splashFading.set(true), 2200);
    setTimeout(() => this.showSplash.set(false),  2600);

    try {
      const profile = await this.keycloak.loadUserProfile();
      const roles = this.keycloak.getUserRoles();

      let role = 'USER';
      if (roles.includes('ADMIN'))        role = 'Admin';
      else if (roles.includes('MANAGER')) role = 'Manager';
      else if (roles.includes('INTEGRATEUR')) role = 'Integrateur';
      else if (roles.includes('CLIENT')) role = 'Client';

      const firstName = profile.firstName || '';
      const lastName  = profile.lastName  || '';
      const name      = `${firstName} ${lastName}`.trim() || profile.username || '';
      const initials  = (firstName[0] || '') + (lastName[0] || '');

      this.user.set({
        id: null,
        email: profile.email || '',
        name,
        role,
        initials: initials.toUpperCase(),
      });

      this.profileSvc.getMe().subscribe({
        next: (me) => this.user.update(u => u && {
          ...u, id: me.id, photoUrl: me.photoUrl,
          chatbotAccess: me.planTier?.chatbotAccess,
          smtpPersonnalise: me.planTier?.smtpPersonnalise,
        }),
        error: () => {}
      });
    } catch (e) {
      console.error('Erreur Keycloak', e);
    }

    this.notifSvc.getRecent().subscribe(items => this.notifications.set(items));

    // Recherche globale avec debounce — attend 300ms d'inactivité et au
    // moins 2 caractères avant d'interroger le backend.
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        const trimmed = q.trim();
        if (trimmed.length < 2) return of(null);
        this.searching.set(true);
        return this.searchSvc.search(trimmed);
      })
    ).subscribe(res => {
      this.searchResults.set(res);
      this.searching.set(false);
    });
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchOpen.set(true);
    this.searchInput$.next(value);
  }

  onSearchFocus() {
    if (this.searchQuery().trim().length >= 2) this.searchOpen.set(true);
  }

  closeSearch() {
    this.searchOpen.set(false);
  }

  hasAnyResult(): boolean {
    const r = this.searchResults();
    return !!r && (r.contacts.length > 0 || r.deals.length > 0 || r.entreprises.length > 0);
  }

  goToContact(id: number) {
    this.closeSearch();
    this.router.navigate(['/app/contacts', id]);
  }

  goToDeal(id: number) {
    this.closeSearch();
    this.router.navigate(['/app/deals', id]);
  }

  goToEntreprise(id: number) {
    this.closeSearch();
    this.router.navigate(['/app/entreprises', id]);
  }

  toggleNotifications() {
    const opening = !this.notifOpen();
    this.notifOpen.set(opening);
    if (opening) this.markAllSeen();
  }

  closeNotifications() {
    this.notifOpen.set(false);
  }

  markAllSeen() {
    const now = Date.now();
    localStorage.setItem(NOTIF_LAST_SEEN_KEY, String(now));
    this.lastSeenAt.set(now);
  }

  notifIcon(kind: NotificationKind): string { return NOTIF_ICONS[kind].icon; }
  notifIconBg(kind: NotificationKind): string { return NOTIF_ICONS[kind].bg; }
  notifIconColor(kind: NotificationKind): string { return NOTIF_ICONS[kind].color; }

  relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(min / 60);
    const j = Math.floor(h / 24);
    const time = this.t().notifications.time;
    if (j > 0) return time.daysAgo.replace('{n}', String(j));
    if (h > 0) return time.hoursAgo.replace('{n}', String(h));
    if (min > 0) return time.minutesAgo.replace('{n}', String(min));
    return time.justNow;
  }

  openProfileModal() {
    this.profileError.set('');
    this.showProfileModal.set(true);
  }

  closeProfileModal() {
    this.showProfileModal.set(false);
  }

  startPhotoUpload(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  onPhotoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.profileError.set(this.t().profileModal.photoTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.profileSvc.updateMyPhoto(dataUrl).subscribe({
        next: (updated) => this.user.update(u => u && { ...u, photoUrl: updated.photoUrl || dataUrl }),
        error: () => this.profileError.set(this.t().profileModal.photoUpdateError)
      });
    };
    reader.readAsDataURL(file);
  }

  toggleSidebar() {
    this.isSidebarExpanded.update(val => !val);
  }

  chatbotOpen(): boolean {
    return this.chatbotRef?.isOpen() ?? false;
  }

  toggleChatbot() {
    this.chatbotRef?.toggle();
  }

  setLang(code: Lang) {
    this.langSvc.setLang(code);
  }

  // undefined = staff (jamais limité par un plan) → accès autorisé par défaut ;
  // pour un CLIENT, seul le plan (chatbotAccess/smtpPersonnalise) décide.
  hasChatbotAccess(): boolean {
    return this.user()?.chatbotAccess !== false;
  }

  hasMailboxAccess(): boolean {
    return this.user()?.smtpPersonnalise !== false;
  }

  roleLabel(role: string | undefined): string {
    switch (role) {
      case 'Admin': return this.t().roles.admin;
      case 'Manager': return this.t().roles.manager;
      case 'Integrateur': return this.t().roles.integrateur;
      case 'Client': return this.t().roles.client;
      default: return this.t().roles.user;
    }
  }

  logout() {
    this.loggingOut.set(true);
    setTimeout(() => this.logoutDoorsClosing.set(true), 900);
    setTimeout(() => this.keycloak.logout(environment.appUrl), 1850);
  }
}