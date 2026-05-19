import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Subset of the BeforeInstallPromptEvent interface the spec defines.
 * Not part of the standard lib.dom types yet, so we re-declare locally.
 */
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

/**
 * PWA install-prompt orchestration.
 *
 * Listens for the browser's `beforeinstallprompt` event, captures it,
 * and exposes a `canInstall` flag plus an `install()` method the header
 * uses to surface a "نصب اپلیکیشن" affordance.
 *
 * The Chrome contract: the saved event is single-use. After calling
 * `prompt()` the browser will not fire another `beforeinstallprompt`
 * for the same session, so `canInstall` must transition false after
 * any outcome (accepted, dismissed, or errored).
 */
@Injectable({ providedIn: 'root' })
export class PwaService {
    private deferredPrompt: BeforeInstallPromptEvent | null = null;

    private _canInstall = false;
    get canInstall(): boolean {
        return this._canInstall;
    }

    private canInstallChanged = new Subject<boolean>();
    get onCanInstallChanged(): Observable<boolean> {
        return this.canInstallChanged.asObservable();
    }

    constructor() {
        if (typeof window === 'undefined') return;

        window.addEventListener('beforeinstallprompt', (event: Event) => {
            // Suppress the browser's mini-infobar so we can present our own
            // install button at a moment of the user's choosing.
            event.preventDefault();
            this.deferredPrompt = event as BeforeInstallPromptEvent;
            this.setCanInstall(true);
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.setCanInstall(false);
        });
    }

    /**
     * Trigger the captured install prompt and resolve with the user's
     * choice. Returns `'unavailable'` if no prompt was ever captured or
     * the underlying call threw (e.g. SecurityError when not in a
     * user-gesture context).
     */
    async install(): Promise<InstallOutcome> {
        const evt = this.deferredPrompt;
        if (!evt) return 'unavailable';

        // Single-use contract: clear the saved event before awaiting so a
        // second concurrent call sees `unavailable` instead of double-prompting.
        this.deferredPrompt = null;
        try {
            await evt.prompt();
            const choice = await evt.userChoice;
            this.setCanInstall(false);
            return choice.outcome;
        } catch {
            this.setCanInstall(false);
            return 'unavailable';
        }
    }

    private setCanInstall(value: boolean): void {
        if (this._canInstall === value) return;
        this._canInstall = value;
        this.canInstallChanged.next(value);
    }
}
