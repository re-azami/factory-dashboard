import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HistoryEntry } from '../../pages/history/models/history-entry';

/**
 * Service for the Query History page.
 *
 * Thin wrapper over `GET /history?limit=N`. The endpoint returns the most
 * recent N entries newest-first; see `backend/app/main.py` for the contract.
 *
 * Loading state is handled by the global `loadingInterceptor`, so callers do
 * not need to wrap requests in `LoadingService.start()`/`stop()`.
 */
@Injectable({ providedIn: 'root' })
export class HistoryService {
    constructor(private readonly http: HttpClient) {}

    list(limit: number): Observable<HistoryEntry[]> {
        const params = new HttpParams().set('limit', String(limit));
        return this.http.get<HistoryEntry[]>(`${environment.apiBase}/history`, { params });
    }
}
