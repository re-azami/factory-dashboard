import { TestBed } from '@angular/core/testing';

import { AppService, ColorMode } from './app.service';
import { IDeviceSize } from '../interfaces/device-size';

/**
 * Unit tests for the minimal AppService (deviceSize + colorMode tracking).
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: window.innerWidth fallback on construction;
 *                                  localStorage.getItem returning null defaults colorMode to LIGHT.
 *  2. Boundary values            — covered: width 600 (isMobile=true), 601 (isMobile=false),
 *                                  900/1200 (isMobile=false); colorMode toggle twice returns to
 *                                  the original mode; observable emits exactly once per toggle.
 *  3. Persian / Unicode text     — N/A in the service: it exposes no Persian strings (UI strings
 *                                  live in templates and are exercised by the header spec).
 *  4. Duplicate rows             — N/A: service is stateless w.r.t. DB rows.
 *  5. Null DB columns            — N/A: service does not touch the database.
 *  6. Calendar conversion        — N/A: no date logic in this service.
 *  7. Permission denials         — N/A: no auth/role logic in this service. localStorage being
 *                                  unavailable (SecurityError) is covered as a "permission-like"
 *                                  edge for robustness.
 *  8. LLM provider switches      — N/A: client-side only; no LLM provider abstraction touched.
 */
const COLOR_MODE_STORAGE_KEY = 'factory-dashboard:color-mode';
const DARK_MODE_CLASS = 'dark-mode';

describe('AppService', () => {
    let service: AppService;
    let originalInnerWidth: number;
    let originalInnerHeight: number;

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;
        originalInnerHeight = window.innerHeight;
        // Ensure a clean color-mode slate per test so cross-test state cannot leak.
        try {
            window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
        } catch {
            /* ignore — storage may be disabled in some environments */
        }
        document.documentElement.classList.remove(DARK_MODE_CLASS);
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
        // Clean up color-mode side effects in case a test failed mid-way.
        try {
            window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        document.documentElement.classList.remove(DARK_MODE_CLASS);
    });

    function setWindowSize(width: number, height: number): void {
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: height });
    }

    function createService(): AppService {
        // Build a fresh TestBed per test so the singleton picks up the current window size
        // and the pre-seeded localStorage value at construction time.
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

    describe('colorMode', () => {
        it('defaults to LIGHT when localStorage has no stored value (empty/missing input)', () => {
            // beforeEach removed the key, so getItem returns null here.
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('reads "DARK" from localStorage on construction and applies dark-mode class to <html>', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'DARK');
            service = createService();

            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();
        });

        it('reads "LIGHT" from localStorage on construction and does NOT add dark-mode class', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'LIGHT');
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('defaults to LIGHT when localStorage contains a malformed value like "blue"', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'blue');
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('defaults to LIGHT when localStorage contains lowercase "light"', () => {
            // The contract is case-sensitive — only the exact string "DARK" enables dark mode.
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'light');
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('defaults to LIGHT when localStorage contains lowercase "dark"', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark');
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('defaults to LIGHT when localStorage contains an empty string', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, '');
            service = createService();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('does not crash when localStorage.getItem throws (SecurityError-style)', () => {
            spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError: storage disabled');

            expect(() => {
                service = createService();
            }).not.toThrow();

            expect(service!.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('toggleColorMode() flips LIGHT -> DARK, adds dark-mode class, and writes "DARK" to localStorage', () => {
            service = createService();
            expect(service.colorMode).toBe('LIGHT');

            const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();

            service.toggleColorMode();

            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();
            expect(setItemSpy).toHaveBeenCalledWith(COLOR_MODE_STORAGE_KEY, 'DARK');
        });

        it('toggleColorMode() flips DARK -> LIGHT, removes dark-mode class, and writes "LIGHT" to localStorage', () => {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'DARK');
            service = createService();
            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();

            const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();

            service.toggleColorMode();

            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
            expect(setItemSpy).toHaveBeenCalledWith(COLOR_MODE_STORAGE_KEY, 'LIGHT');
        });

        it('boundary: two consecutive toggles return to the original mode (LIGHT->DARK->LIGHT)', () => {
            service = createService();
            expect(service.colorMode).toBe('LIGHT');

            service.toggleColorMode();
            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();

            service.toggleColorMode();
            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();
        });

        it('boundary: onColorModeChanged emits exactly once per toggleColorMode() call', () => {
            service = createService();

            const received: ColorMode[] = [];
            const sub = service.onColorModeChanged.subscribe((mode: ColorMode) => received.push(mode));

            service.toggleColorMode();

            expect(received.length).toBe(1);
            expect(received[0]).toBe('DARK');

            service.toggleColorMode();

            expect(received.length).toBe(2);
            expect(received[1]).toBe('LIGHT');

            sub.unsubscribe();
        });

        it('onColorModeChanged is a multicast observable (Subject) — does not replay past values', () => {
            service = createService();

            // Emit BEFORE subscribing.
            service.toggleColorMode();

            const received: ColorMode[] = [];
            const sub = service.onColorModeChanged.subscribe((mode: ColorMode) => received.push(mode));

            expect(received.length).toBe(0);

            sub.unsubscribe();
        });

        it('toggleColorMode() does not crash when localStorage.setItem throws (SecurityError-style)', () => {
            service = createService();
            spyOn(Storage.prototype, 'setItem').and.throwError('SecurityError: storage disabled');

            expect(() => service.toggleColorMode()).not.toThrow();

            // In-memory state and DOM class still update even though persistence failed.
            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();
        });

        it('idempotency: rapid toggle sequence (LIGHT -> DARK -> LIGHT -> DARK) leaves state consistent', () => {
            service = createService();
            expect(service.colorMode).toBe('LIGHT');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeFalse();

            service.toggleColorMode(); // DARK
            service.toggleColorMode(); // LIGHT
            service.toggleColorMode(); // DARK

            expect(service.colorMode).toBe('DARK');
            expect(document.documentElement.classList.contains(DARK_MODE_CLASS)).toBeTrue();
            // Final localStorage value matches the final state.
            expect(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('DARK');
        });
    });
});
