import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { HistoryService } from '../../shared/services/history.service';
import { PageService } from '../../shared/services/page.service';
import { HistoryEntry } from './models/history-entry';

/**
 * Query History page. Fetches the most recent N entries via `GET /history?limit=N`,
 * lets the user adjust N with a slider, and exposes each entry's tool_calls in an
 * expandable JSON view.
 *
 * The global loadingInterceptor handles the page-header progress bar — the
 * component only tracks an inline spinner state via `loading`.
 */
@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrl: './history.component.scss',
    standalone: false,
})
export class HistoryComponent implements OnInit, OnDestroy {
    public limit: number = 20;
    public entries: HistoryEntry[] = [];
    public loading: boolean = false;
    public error: string | null = null;

    private fetchSub?: Subscription;

    constructor(
        private readonly historyService: HistoryService,
        private readonly pageService: PageService,
    ) {}

    ngOnInit(): void {
        this.pageService.setPageTitle({ title: 'تاریخچه پرسش‌ها' });
        this.load();
    }

    ngOnDestroy(): void {
        this.fetchSub?.unsubscribe();
    }

    /**
     * (Re)load the history list. Cancels any in-flight request so rapid slider
     * changes can't race and overwrite each other with stale results.
     */
    load(): void {
        this.fetchSub?.unsubscribe();
        this.loading = true;
        this.error = null;

        this.fetchSub = this.historyService.list(this.limit).subscribe({
            next: (result) => {
                this.entries = result;
                this.loading = false;
            },
            error: () => {
                this.error = 'بارگذاری تاریخچه با خطا مواجه شد';
                this.entries = [];
                this.loading = false;
            },
        });
    }

    onLimitChange(newLimit: number): void {
        this.limit = newLimit;
        this.load();
    }

    onRefresh(): void {
        this.load();
    }

    /** Stable identity for *ngFor / @for so duplicate question strings still rerender correctly. */
    trackEntry(_index: number, entry: HistoryEntry): number {
        return entry.id;
    }

    /** Pretty-prints a tool-call input/output for the expandable JSON view. */
    formatJson(value: unknown): string {
        if (value === null || value === undefined) return '';
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }
}
