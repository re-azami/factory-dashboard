import { TestBed } from '@angular/core/testing';

import { AppService } from './app.service';
import { IDeviceSize } from '../interfaces/device-size';

/**
 * Unit tests for the minimal AppService (deviceSize tracking only).
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: window.innerWidth fallback on construction
 *  2. Boundary values            — covered: width 600 (isMobile=true), 601 (isMobile=false),
 *                                  900/1200 (isMobile=false)
 *  3. Persian / Unicode text     — N/A: service exposes no Persian strings; UI strings live in
 *                                  templates and are exercised by component specs.
 *  4. Duplicate rows             — N/A: service is stateless w.r.t. DB rows.
 *  5. Null DB columns            — N/A: service does not touch the database.
 *  6. Calendar conversion        — N/A: no date logic in this service.
 *  7. Permission denials         — N/A: no auth/role logic in this service.
 *  8. LLM provider switches      — N/A: client-side only; no LLM provider abstraction touched.
 */
describe('AppService', () => {
    let service: AppService;
    let originalInnerWidth: number;
    let originalInnerHeight: number;

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;
        originalInnerHeight = window.innerHeight;
    });

    afterEach(() => {
        // Restore window dimensions to whatever Karma set them to before the test ran.
        Object.defineProperty(window, 'innerWidth', {
            configurable: true,
            writable: true,
            value: originalInnerWidth,
        });
        Object.defineProperty(window, 'innerHeight', {
            configurable: true,
            writable: true,
            value: originalInnerHeight,
        });
    });

    function setWindowSize(width: number, height: number): void {
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: height });
    }

    function createService(): AppService {
        // Build a fresh TestBed per test so the singleton picks up the current window size
        // at construction time.
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});
        return TestBed.inject(AppService);
    }

    it('initialises deviceSize on construction using window.innerWidth/innerHeight', () => {
        setWindowSize(1280, 720);
        service = createService();

        const size: IDeviceSize = service.deviceSize;
        expect(size.width).toBe(1280);
        expect(size.height).toBe(720);
        expect(size.isMobile).toBeFalse();
    });

    it('boundary: width 600 -> isMobile true (<=600 is mobile)', () => {
        setWindowSize(600, 800);
        service = createService();

        expect(service.deviceSize.width).toBe(600);
        expect(service.deviceSize.isMobile).toBeTrue();
    });

    it('boundary: width 601 -> isMobile false (off-by-one above threshold)', () => {
        setWindowSize(601, 800);
        service = createService();

        expect(service.deviceSize.width).toBe(601);
        expect(service.deviceSize.isMobile).toBeFalse();
    });

    it('boundary: width 800 -> isMobile false (well above threshold)', () => {
        setWindowSize(800, 600);
        service = createService();

        expect(service.deviceSize.isMobile).toBeFalse();
    });

    it('boundary: width 900 -> isMobile false', () => {
        setWindowSize(900, 600);
        service = createService();

        expect(service.deviceSize.isMobile).toBeFalse();
    });

    it('boundary: width 1200 -> isMobile false', () => {
        setWindowSize(1200, 800);
        service = createService();

        expect(service.deviceSize.isMobile).toBeFalse();
    });

    it('setDeviceSize() refreshes deviceSize from current window dimensions', () => {
        setWindowSize(1024, 768);
        service = createService();

        setWindowSize(500, 900);
        service.setDeviceSize();

        expect(service.deviceSize.width).toBe(500);
        expect(service.deviceSize.height).toBe(900);
        expect(service.deviceSize.isMobile).toBeTrue();
    });

    it('subscribers to onDeviceSizeChanged receive new value when setDeviceSize() is called', () => {
        setWindowSize(1024, 768);
        service = createService();

        const received: IDeviceSize[] = [];
        const sub = service.onDeviceSizeChanged.subscribe((size: IDeviceSize) => received.push(size));

        setWindowSize(400, 700);
        service.setDeviceSize();
        setWindowSize(1500, 900);
        service.setDeviceSize();

        expect(received.length).toBe(2);
        expect(received[0]).toEqual({ width: 400, height: 700, isMobile: true });
        expect(received[1]).toEqual({ width: 1500, height: 900, isMobile: false });

        sub.unsubscribe();
    });

    it('onDeviceSizeChanged is a multicast observable (Subject) — does not replay past values', () => {
        setWindowSize(1024, 768);
        service = createService();

        // Emit BEFORE subscribing.
        setWindowSize(400, 700);
        service.setDeviceSize();

        const received: IDeviceSize[] = [];
        const sub = service.onDeviceSizeChanged.subscribe((size: IDeviceSize) => received.push(size));

        // The earlier emission must not have been replayed.
        expect(received.length).toBe(0);

        sub.unsubscribe();
    });

    it('isMobileDevice() returns a boolean derived from navigator.userAgent', () => {
        service = createService();

        // We do not assert true/false (depends on Karma's headless Chrome UA), only that the
        // service returns a deterministic boolean without throwing.
        const result = service.isMobileDevice();
        expect(typeof result).toBe('boolean');
    });

    it('does not register any global window listeners (no leaked subscriptions)', () => {
        // The minimal AppService does not call window.addEventListener — that is PageComponent's
        // responsibility. Guard the contract by spying on addEventListener around construction.
        const spy = spyOn(window, 'addEventListener').and.callThrough();
        service = createService();
        expect(spy).not.toHaveBeenCalled();
    });
});
