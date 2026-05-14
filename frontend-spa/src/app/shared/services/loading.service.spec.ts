import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

/**
 * Unit tests for LoadingService.
 *
 * The service is reference-counted: start() increments a `pending` counter, stop()
 * decrements it (clamped at 0); loading is true while pending > 0 and emits only on
 * transitions (no duplicate emissions for the same value).
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: loading starts false; stop() without prior start()
 *                                  must not throw and must not go negative.
 *  2. Boundary values            — covered: counter at 0/1/N transitions; balanced vs unbalanced
 *                                  start/stop pairs.
 *  3. Persian / Unicode text     — N/A: service exposes no string values.
 *  4. Duplicate rows             — N/A: not DB-related.
 *  5. Null DB columns            — N/A: not DB-related.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth/role logic.
 *  8. LLM provider switches      — N/A: client-side only.
 */
describe('LoadingService', () => {
    let service: LoadingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LoadingService);
    });

    it('loading starts false', () => {
        expect(service.loading).toBeFalse();
    });

    it('start() sets loading true and emits true', () => {
        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        service.start();

        expect(service.loading).toBeTrue();
        expect(received).toEqual([true]);

        sub.unsubscribe();
    });

    it('balanced start()/stop() returns loading to false and emits true then false', () => {
        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        service.start();
        service.stop();

        expect(service.loading).toBeFalse();
        expect(received).toEqual([true, false]);

        sub.unsubscribe();
    });

    it('reference-counted: two concurrent start() calls require two stop() calls to clear', () => {
        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        service.start();
        service.start();

        expect(service.loading).toBeTrue();
        // Only the first start() flips false->true; the second start() must NOT re-emit.
        expect(received).toEqual([true]);

        service.stop();
        // Counter is still 1 — loading must remain true and not re-emit.
        expect(service.loading).toBeTrue();
        expect(received).toEqual([true]);

        service.stop();
        expect(service.loading).toBeFalse();
        expect(received).toEqual([true, false]);

        sub.unsubscribe();
    });

    it('many concurrent loads (N=5) clear cleanly with N matching stops', () => {
        for (let i = 0; i < 5; i++) service.start();
        expect(service.loading).toBeTrue();

        for (let i = 0; i < 5; i++) service.stop();
        expect(service.loading).toBeFalse();
    });

    it('boundary: stop() with no prior start() does not throw and does not emit', () => {
        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        expect(() => service.stop()).not.toThrow();
        expect(service.loading).toBeFalse();
        expect(received).toEqual([]);

        sub.unsubscribe();
    });

    it('boundary: extra stop() after counter reaches 0 stays at 0 (clamp via Math.max)', () => {
        service.start();
        service.stop();
        // Counter is now 0; an additional stop() is a no-op.
        expect(() => service.stop()).not.toThrow();
        expect(service.loading).toBeFalse();

        // A subsequent start() must still flip back to true.
        service.start();
        expect(service.loading).toBeTrue();
        service.stop();
        expect(service.loading).toBeFalse();
    });

    it('onLoadingChanged is multicast (Subject) — does not replay past values to late subscribers', () => {
        service.start();
        service.stop();

        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        // No replay — Subject, not BehaviorSubject.
        expect(received).toEqual([]);

        service.start();
        expect(received).toEqual([true]);

        sub.unsubscribe();
    });

    it('emits only on transitions, not on every start/stop call', () => {
        const received: boolean[] = [];
        const sub = service.onLoadingChanged.subscribe((v) => received.push(v));

        service.start(); // true
        service.start(); // no emit (already true)
        service.start(); // no emit (already true)
        service.stop(); // no emit (still pending=2)
        service.stop(); // no emit (still pending=1)
        service.stop(); // false

        expect(received).toEqual([true, false]);

        sub.unsubscribe();
    });
});
