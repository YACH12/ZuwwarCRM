import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, BackendUser } from '../../services/user.service';
import { AvatarService } from '../../services/avatar.service';
import { LanguageService } from '../../services/language.service';
import { usersTranslations } from '../../shared/i18n/users.i18n';

interface User {
  id: number;
  name: string;
  prenom: string;
  nom: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Intégrateur';
  roleRaw: string;
  status: 'Active' | 'Inactive';
  initials: string;
  avatarUrl: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  enabled: boolean;
  IDkeyclock?: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ['Dashboard', 'Contacts', 'Deals', 'Activities', 'Campaigns', 'Clients', 'Users', 'Settings'],
  Manager: ['Dashboard', 'Contacts', 'Deals', 'Activities', 'Campaigns', 'Clients'],
  Intégrateur: ['Contacts', 'Deals', 'Activities', 'Campaigns'],
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { font-family: 'Inter', sans-serif; }
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
    }
    .page-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .page-sub { color: #6B7280; font-size: 14px; }
    .btn-primary {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      border: none; border-radius: 10px;
      color: white; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 16px;
      background: white; border: 1px solid #E5E7EB;
      border-radius: 10px; color: #374151;
      font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-outline:hover { background: #F9FAFB; }

    /* STATS */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: white; border: 1px solid #E5E7EB;
      border-radius: 14px; padding: 18px 20px;
    }
    .stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .stat-label { font-size: 12px; color: #9CA3AF; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .stat-value { font-size: 26px; font-weight: 700; color: #111827; }
    .stat-sub { font-size: 12px; color: #6B7280; margin-top: 3px; }

    /* LIST CARD (holds toolbar + table, toolbar & header stay fixed, body scrolls) */
    .list-card {
      background: white; border: 1px solid #E5E7EB;
      border-radius: 14px; overflow: hidden;
      display: flex; flex-direction: column;
    }

    /* TOOLBAR - stays fixed on top, does not scroll away */
    .toolbar {
      display: flex; align-items: center; gap: 12px;
      background: white;
      padding: 14px 20px;
      border-bottom: 1px solid #E5E7EB;
      position: sticky; top: 0; z-index: 3;
      flex-shrink: 0;
    }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: #F9FAFB; border: 1px solid #E5E7EB;
      border-radius: 9px; padding: 8px 14px; flex: 1;
    }
    .search-box input {
      border: none; background: none; outline: none;
      font-size: 14px; color: #374151; width: 100%;
    }
    .search-box input::placeholder { color: #9CA3AF; }
    .filter-select {
      padding: 8px 14px; border: 1px solid #E5E7EB;
      border-radius: 9px; background: white;
      font-size: 13px; color: #374151; outline: none; cursor: pointer;
    }

    /* TABLE - scrollable body, not a fixed/rigid height, header stays visible while scrolling */
    .table-wrap {
      overflow-y: auto;
      overflow-x: auto;
      max-height: 65vh;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #F9FAFB; position: sticky; top: 0; z-index: 2; }
    th {
      text-align: left; padding: 12px 20px;
      font-size: 11px; font-weight: 600; color: #9CA3AF;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid #E5E7EB;
      white-space: nowrap;
      background: #F9FAFB;
    }
    td { padding: 14px 20px; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #FAFAFA; }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-wrap { position: relative; width: 38px; height: 38px; flex-shrink: 0; cursor: pointer; border-radius: 50%; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      object-fit: cover; background: #F3F4F6; display: block;
    }
    .avatar-edit-badge {
      position: absolute; inset: 0; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(17,24,39,0.55); color: white; font-size: 13px;
      opacity: 0; transition: opacity 0.15s;
    }
    .avatar-wrap:hover .avatar-edit-badge { opacity: 1; }
    .user-name { font-size: 14px; font-weight: 600; color: #111827; }
    .user-email { font-size: 12px; color: #9CA3AF; margin-top: 1px; }

    .role-badge {
      display: inline-block; padding: 3px 10px;
      border-radius: 20px; font-size: 12px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .role-admin { background: rgba(124,58,237,0.1); color: #7C3AED; }
    .role-manager { background: rgba(59,130,246,0.1); color: #2563EB; }
    .role-intégrateur { background: rgba(16,185,129,0.1); color: #059669; }

    .status-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 500;
    }
    .status-active { background: rgba(16,185,129,0.1); color: #059669; }
    .status-inactive { background: rgba(156,163,175,0.15); color: #6B7280; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }

    .perms-wrap { display: flex; gap: 4px; flex-wrap: wrap; }
    .perm-tag {
      font-size: 10px; font-weight: 500; padding: 2px 7px;
      border-radius: 5px; background: #F3F4F6; color: #6B7280;
    }

    .actions { display: flex; gap: 6px; }
    .action-btn {
      padding: 5px 12px; border-radius: 7px;
      font-size: 12px; font-weight: 500;
      cursor: pointer; border: 1px solid #E5E7EB;
      background: white; color: #374151; transition: all 0.15s;
    }
    .action-btn:hover { background: #F3F4F6; }
    .action-btn.edit { background: rgba(124,58,237,0.07); color: #7C3AED; border-color: rgba(124,58,237,0.2); }
    .action-btn.edit:hover { background: rgba(124,58,237,0.14); }
    .action-btn.danger { background: rgba(239,68,68,0.07); color: #DC2626; border-color: rgba(239,68,68,0.2); }
    .action-btn.danger:hover { background: rgba(239,68,68,0.14); }
    .action-btn.toggle { background: rgba(245,158,11,0.07); color: #D97706; border-color: rgba(245,158,11,0.2); }
    .action-btn.toggle:hover { background: rgba(245,158,11,0.14); }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5); z-index: 100;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    }
    .modal {
      background: white; border-radius: 20px; padding: 32px;
      width: 520px; max-width: calc(100vw - 32px); max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }
    .modal-title { font-size: 18px; font-weight: 700; color: #111827; }
    .modal-close {
      width: 32px; height: 32px; border-radius: 8px;
      background: #F3F4F6; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #6B7280; font-size: 18px;
    }
    .modal-close:hover { background: #E5E7EB; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .field input, .field select {
      width: 100%; border: 1px solid #E5E7EB; border-radius: 10px;
      padding: 10px 14px; font-size: 14px; color: #111827;
      outline: none; background: #FAFAFA; box-sizing: border-box;
      font-family: inherit; transition: border-color 0.2s;
    }
    .field input:focus, .field select:focus { border-color: #7C3AED; background: white; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .perms-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .perm-check {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border: 1px solid #E5E7EB;
      border-radius: 8px; cursor: pointer; font-size: 13px;
      color: #374151; transition: all 0.15s;
      user-select: none;
    }
    .perm-check.checked { background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.3); color: #7C3AED; font-weight: 500; }
    .perm-check input[type=checkbox] { display: none; }
    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

    /* EMPTY */
    .empty { text-align: center; padding: 48px; color: #9CA3AF; font-size: 14px; }

    /* DELETE CONFIRM */
    .confirm-body { text-align: center; padding: 8px 0 16px; }
    .confirm-icon { font-size: 40px; margin-bottom: 12px; }
    .confirm-text { font-size: 15px; color: #374151; margin-bottom: 6px; }
    .confirm-sub { font-size: 13px; color: #9CA3AF; }
  `],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t().title }}</h1>
          <p class="page-sub">{{ t().subtitle }}</p>
        </div>
        <button class="btn-primary" (click)="openAdd()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ t().addUser }}
        </button>
      </div>

      <!-- STATS -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(124,58,237,0.1)">
            <svg width="20" height="20" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div class="stat-label">{{ t().stats.totalUsers }}</div>
          <div class="stat-value">{{ users().length }}</div>
          <div class="stat-sub">{{ t().stats.totalUsersSub }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(16,185,129,0.1)">
            <svg width="20" height="20" fill="none" stroke="#10B981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-label">{{ t().stats.active }}</div>
          <div class="stat-value">{{ activeCount() }}</div>
          <div class="stat-sub">{{ t().stats.activeSub }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(59,130,246,0.1)">
            <svg width="20" height="20" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div class="stat-label">{{ t().stats.admins }}</div>
          <div class="stat-value">{{ roleCount('Admin') }}</div>
          <div class="stat-sub">{{ t().stats.adminsSub }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(245,158,11,0.1)">
            <svg width="20" height="20" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div class="stat-label">{{ t().stats.roles }}</div>
          <div class="stat-value">3</div>
          <div class="stat-sub">{{ t().stats.rolesSub }}</div>
        </div>
      </div>

      <!-- LIST CARD: toolbar (search + filters) fixed on top, table body scrolls independently -->
      <div class="list-card">
        <!-- TOOLBAR -->
        <div class="toolbar">
          <div class="search-box">
            <svg width="15" height="15" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" [placeholder]="t().toolbar.searchPlaceholder" [(ngModel)]="search" />
          </div>
          <select class="filter-select" [(ngModel)]="roleFilter">
            <option value="">{{ t().toolbar.allRoles }}</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Intégrateur</option>
          </select>
          <select class="filter-select" [(ngModel)]="statusFilter">
            <option value="">{{ t().toolbar.allStatus }}</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <!-- TABLE -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t().table.user }}</th>
                <th>{{ t().table.role }}</th>
                <th>{{ t().table.permissions }}</th>
                <th>{{ t().table.status }}</th>
                <th>{{ t().table.lastLogin }}</th>
                <th>{{ t().table.created }}</th>
                <th>{{ t().table.actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (u of filtered(); track u.id) {
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="avatar-wrap" [title]="t().photo.change" (click)="startPhotoUpload(u, photoInput)">
                        <img class="avatar" [src]="u.avatarUrl" [alt]="u.name" />
                        <div class="avatar-edit-badge">📷</div>
                      </div>
                      <div>
                        <div class="user-name">{{ u.name }}</div>
                        <div class="user-email">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [class]="'role-' + u.role.toLowerCase()">{{ u.role }}</span>
                  </td>
                  <td>
                    <div class="perms-wrap">
                      @for (p of u.permissions.slice(0,4); track p) {
                        <span class="perm-tag">{{ p }}</span>
                      }
                      @if (u.permissions.length > 4) {
                        <span class="perm-tag">+{{ u.permissions.length - 4 }}</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" [class]="'status-' + u.status.toLowerCase()">
                      <span class="status-dot" [style.background]="u.status === 'Active' ? '#10B981' : '#9CA3AF'"></span>
                      {{ u.status === 'Active' ? t().status.active : t().status.inactive }}
                    </span>
                  </td>
                  <td style="font-size:13px;color:#6B7280;">{{ u.lastLogin }}</td>
                  <td style="font-size:13px;color:#6B7280;">{{ u.createdAt }}</td>
                  <td>
                    <div class="actions">
                      <button class="action-btn edit" (click)="openEdit(u)">{{ t().actions.edit }}</button>
                      <button class="action-btn toggle" (click)="toggleStatus(u)">
                        {{ u.status === 'Active' ? t().actions.disable : t().actions.enable }}
                      </button>
                      <button class="action-btn danger" (click)="confirmDelete(u)">{{ t().actions.delete }}</button>
                    </div>
                  </td>
                </tr>
              }
              @if (filtered().length === 0) {
                <tr><td colspan="7"><div class="empty">{{ t().empty }}</div></td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input #photoInput type="file" accept="image/*" style="display:none" (change)="onPhotoFileSelected($event)" />

    <!-- ADD / EDIT MODAL -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()" (keydown.escape)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" [attr.aria-label]="editingUser ? t().modal.editTitle : t().modal.addTitle">
          <div class="modal-header">
            <div class="modal-title">{{ editingUser ? t().modal.editTitle : t().modal.addTitle }}</div>
            <button class="modal-close" (click)="closeModal()" aria-label="Fermer">×</button>
          </div>

          <div class="two-col">
            <div class="field">
              <label>{{ t().modal.firstName }}</label>
              <input type="text" [(ngModel)]="form.prenom" [placeholder]="t().modal.firstNamePlaceholder" />
            </div>
            <div class="field">
              <label>{{ t().modal.lastName }}</label>
              <input type="text" [(ngModel)]="form.nom" [placeholder]="t().modal.lastNamePlaceholder" />
            </div>
          </div>
          <div class="field">
            <label>{{ t().modal.email }}</label>
            <input type="email" [(ngModel)]="form.email" placeholder="user&#64;exemple.com" />
          </div>

          @if (!editingUser) {
            <div class="field">
              <label>{{ t().modal.password }}</label>
              <input type="password" [(ngModel)]="form.password" [placeholder]="t().modal.passwordPlaceholder" />
            </div>
          }

          <div class="two-col">
            <div class="field">
              <label>{{ t().modal.role }}</label>
              <select [(ngModel)]="form.role" (ngModelChange)="onRoleChange($event)">
                <option>Admin</option>
                <option>Manager</option>
                <option>Intégrateur</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t().modal.status }}</label>
              <select [(ngModel)]="form.status">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>{{ t().modal.permissions }}</label>
            <div class="perms-grid">
              @for (p of allPermissions; track p) {
                <label class="perm-check" [class.checked]="form.permissions.includes(p)" (click)="togglePerm(p)">
                  <input type="checkbox" [checked]="form.permissions.includes(p)" />
                  {{ p }}
                </label>
              }
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-outline" (click)="closeModal()">{{ t().modal.cancel }}</button>
            <button class="btn-primary" (click)="saveUser()">
              {{ editingUser ? t().modal.saveChanges : t().modal.createUser }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- DELETE CONFIRM MODAL -->
    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)" (keydown.escape)="deleteTarget.set(null)">
        <div class="modal" style="max-width:400px" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="confirm-body">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-text">{{ t().deleteModal.confirmText.split('{name}')[0] }}<strong>{{ deleteTarget()!.name }}</strong>{{ t().deleteModal.confirmText.split('{name}')[1] }}</div>
            <div class="confirm-sub">{{ t().deleteModal.warning }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="deleteTarget.set(null)">{{ t().deleteModal.cancel }}</button>
            <button class="btn-primary" style="background:linear-gradient(135deg,#EF4444,#DC2626)" (click)="deleteUser()">
              {{ t().deleteModal.deleteUser }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UsersComponent implements OnInit {
  private langSvc = inject(LanguageService);
  private avatarSvc = inject(AvatarService);
  t = this.langSvc.select(usersTranslations);

  photoUploadTargetId: number | null = null;

  search = '';
  roleFilter = '';
  statusFilter = '';
  showModal = signal(false);
  editingUser: User | null = null;
  deleteTarget = signal<User | null>(null);
  saving = signal(false);
  errorMsg = signal('');

  allPermissions = ['Dashboard', 'Contacts', 'Deals', 'Activities', 'Campaigns', 'Clients', 'Users', 'Settings'];

  private readonly ROLE_MAP: Record<string, string> = { 'Admin': 'Admin', 'Manager': 'Manager', 'Intégrateur': 'Integrateur' };
  private readonly ROLE_DISPLAY_MAP: Record<string, string> = { 'Admin': 'Admin', 'Manager': 'Manager', 'Integrateur': 'Intégrateur' };

  form: { prenom: string; nom: string; email: string; password: string; role: string; status: string; permissions: string[] } = {
    prenom: '', nom: '', email: '', password: '', role: 'Manager', status: 'Active', permissions: [...ROLE_PERMISSIONS['Manager']],
  };

  users = signal<User[]>([]);

  constructor(private userSvc: UserService) {}

  ngOnInit() { this.loadUsers(); }

  private loadUsers() {
    this.userSvc.getAll().subscribe({
      next: (page) => {
        this.users.set(page.content.map((u, i) => this.mapToDisplay(u, i)));
      },
      error: () => this.errorMsg.set(this.t().errors.loadUsers)
    });
  }

  private mapToDisplay(u: BackendUser, index: number): User {
    const name = `${u.prenom} ${u.nom}`;
    const initials = `${u.prenom[0] || ''}${u.nom[0] || ''}`.toUpperCase();
    const roleDisplay = (this.ROLE_DISPLAY_MAP[u.role] || u.role) as 'Admin' | 'Manager' | 'Intégrateur';
    return {
      id: u.id,
      name,
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      role: roleDisplay,
      roleRaw: u.role,
      status: u.enabled ? 'Active' : 'Inactive',
      initials,
      avatarUrl: this.avatarSvc.resolve(u.photoUrl, u.email || name),
      lastLogin: 'N/A',
      createdAt: u.creatAt ? new Date(u.creatAt).toLocaleDateString('fr-FR') : '-',
      permissions: ROLE_PERMISSIONS[roleDisplay] || [],
      enabled: u.enabled,
      IDkeyclock: u.IDkeyclock
    };
  }

  startPhotoUpload(u: User, input: HTMLInputElement) {
    this.photoUploadTargetId = u.id;
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
      this.userSvc.updatePhoto(targetId, dataUrl).subscribe({
        next: (updated) => {
          this.users.update(list => list.map(x => x.id === targetId ? { ...x, avatarUrl: updated.photoUrl || dataUrl } : x));
        },
        error: () => this.errorMsg.set(this.t().errors.photoUpdateError)
      });
    };
    reader.readAsDataURL(file);
  }

  filtered = computed(() => {
    return this.users().filter(u => {
      const matchSearch = !this.search ||
        u.name.toLowerCase().includes(this.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.search.toLowerCase());
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const matchStatus = !this.statusFilter || u.status === this.statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  });

  activeCount = computed(() => this.users().filter(u => u.status === 'Active').length);
  roleCount(role: string) { return this.users().filter(u => u.role === role).length; }

  openAdd() {
    this.editingUser = null;
    this.errorMsg.set('');
    this.form = { prenom: '', nom: '', email: '', password: '', role: 'Manager', status: 'Inactive', permissions: [...ROLE_PERMISSIONS['Manager']] };
    this.showModal.set(true);
  }

  openEdit(u: User) {
    this.editingUser = u;
    this.errorMsg.set('');
    this.form = { prenom: u.prenom, nom: u.nom, email: u.email, password: '', role: u.role, status: u.status, permissions: [...u.permissions] };
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingUser = null; }

  onRoleChange(role: string) {
    this.form.permissions = [...(ROLE_PERMISSIONS[role] || [])];
  }

  togglePerm(p: string) {
    const idx = this.form.permissions.indexOf(p);
    if (idx >= 0) this.form.permissions.splice(idx, 1);
    else this.form.permissions.push(p);
  }

  saveUser() {
    if (!this.form.prenom || !this.form.nom || !this.form.email) return;
    const roleRaw = this.ROLE_MAP[this.form.role] || this.form.role;
    this.saving.set(true);
    this.errorMsg.set('');

    if (this.editingUser) {
      this.userSvc.update(this.editingUser.id, {
        prenom: this.form.prenom,
        nom: this.form.nom,
        email: this.form.email,
        role: roleRaw,
        enabled: this.form.status === 'Active'
      }).subscribe({
        next: () => { this.saving.set(false); this.loadUsers(); this.closeModal(); },
        error: (e) => { this.saving.set(false); this.errorMsg.set(e.error?.message || this.t().errors.updateError); }
      });
    } else {
      if (!this.form.password) { this.errorMsg.set(this.t().errors.passwordRequired); return; }
      this.userSvc.create({
        prenom: this.form.prenom,
        nom: this.form.nom,
        email: this.form.email,
        password: this.form.password,
        role: roleRaw,
        enabled: this.form.status === 'Active'
      }).subscribe({
        next: () => { this.saving.set(false); this.loadUsers(); this.closeModal(); },
        error: (e) => { this.saving.set(false); this.errorMsg.set(e.error?.message || this.t().errors.createError); }
      });
    }
  }

  toggleStatus(u: User) {
    this.userSvc.update(u.id, {
      prenom: u.prenom, nom: u.nom, email: u.email,
      role: u.roleRaw, enabled: u.status !== 'Active'
    }).subscribe({
      next: () => {
        this.users.update(list => list.map(x =>
          x.id === u.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active', enabled: !x.enabled } : x
        ));
      },
      error: (e) => this.errorMsg.set(e.error?.message || this.t().errors.generic)
    });
  }

  confirmDelete(u: User) { this.deleteTarget.set(u); }

  deleteUser() {
    const target = this.deleteTarget();
    if (!target) return;
    this.userSvc.delete(target.id).subscribe({
      next: () => { this.users.update(list => list.filter(u => u.id !== target.id)); this.deleteTarget.set(null); },
      error: (e) => { this.deleteTarget.set(null); this.errorMsg.set(e.error?.message || this.t().errors.deleteError); }
    });
  }
}