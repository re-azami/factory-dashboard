import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private _loading: boolean = false;
    get loading(): boolean {
        return this._loading;
    }

    private loadingChanged: Subject<boolean> = new Subject<boolean>();
    get onLoadingChanged(): Observable<boolean> {
        return this.loadingChanged.asObservable();
    }

    private pending: number = 0;

    start(): void {
        this.pending++;
        this.setLoading(true);
    }

    stop(): void {
        this.pending = Math.max(0, this.pending - 1);
        if (this.pending === 0) this.setLoading(false);
    }

    private setLoading(value: boolean): void {
        if (this._loading === value) return;
        this._loading = value;
        this.loadingChanged.next(value);
    }
}
