import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

export type NotificationKind = 'contact' | 'deal_won' | 'deal_lost' | 'deal_new' | 'campaign';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  subtitle: string;
  date: string;
}

/**
 * Pas de backend de notifications dédié — on dérive les événements récents
 * (nouveaux contacts, deals gagnés/perdus, campagnes envoyées) des endpoints
 * CRM déjà existants, comme le fait le dashboard.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getRecent(): Observable<NotificationItem[]> {
    return forkJoin({
      contacts: this.http.get<any>('/contacts?size=8&sort=creatAt,desc').pipe(catchError(() => of({ content: [] }))),
      deals: this.http.get<any>('/deals?size=10&sort=createdAt,desc').pipe(catchError(() => of({ content: [] }))),
      campaigns: this.http.get<any>('/campaigns?size=8&sort=createdAt,desc').pipe(catchError(() => of({ content: [] }))),
    }).pipe(
      map(({ contacts, deals, campaigns }) => {
        const items: NotificationItem[] = [];

        (contacts.content ?? []).forEach((c: any) => {
          if (!c.creatAt) return;
          items.push({ id: `contact-${c.id}`, kind: 'contact', subtitle: `${c.prenom} ${c.nom}`, date: c.creatAt });
        });

        (deals.content ?? []).forEach((d: any) => {
          if (d.stage === 'GAGNE' && (d.dateCloture || d.createdAt)) {
            items.push({ id: `deal-${d.id}`, kind: 'deal_won', subtitle: d.titre, date: d.dateCloture ?? d.createdAt });
          } else if (d.stage === 'PERDU' && (d.dateCloture || d.createdAt)) {
            items.push({ id: `deal-${d.id}`, kind: 'deal_lost', subtitle: d.titre, date: d.dateCloture ?? d.createdAt });
          } else if (d.createdAt) {
            items.push({ id: `deal-${d.id}`, kind: 'deal_new', subtitle: d.titre, date: d.createdAt });
          }
        });

        (campaigns.content ?? []).forEach((c: any) => {
          if (c.statut === 'SENT' && (c.sentAt || c.creatAt)) {
            items.push({ id: `campaign-${c.id}`, kind: 'campaign', subtitle: c.name, date: c.sentAt ?? c.creatAt });
          }
        });

        return items
          .filter(i => !!i.date)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);
      })
    );
  }
}
