import { Injectable } from '@angular/core';
import DeviceDetector from 'device-detector-js';
import { Observable, Subject } from 'rxjs';

import { IDeviceSize } from '../interfaces/device-size';

export type ColorMode = 'LIGHT' | 'DARK';

const COLOR_MODE_STORAGE_KEY = 'factory-dashboard:color-mode';
const DARK_MODE_CLASS = 'dark-mode';

/**
 * Minimal app-level service: tracks device size and color mode.
 *
 * The reference frontend (temp/frontend-true) splits this across several
 * providers — DeviceService, ConfigService, VersionService — most of which
 * depend on backend APIs we do not implement. We keep just the
 * infrastructure pieces (deviceSize, colorMode) here. Color-mode toggling
 * was added in UI-001a-dark; pattern mirrors deviceSize.
 */
@Injectable({ providedIn: 'root' })
export class AppService {
    private _deviceSize: IDeviceSize = {
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 600 : false,
    };
    get deviceSize(): IDeviceSize {
        return this._deviceSize;
    }

    private deviceSizeChanged: Subject<IDeviceSize> = new Subject<IDeviceSize>();
    get onDeviceSizeChanged(): Observable<IDeviceSize> {
        return this.deviceSizeChanged.asObservable();
    }

    private _colorMode: ColorMode = 'LIGHT';
    get colorMode(): ColorMode {
        return this._colorMode;
    }

    private colorModeChanged: Subject<ColorMode> = new Subject<ColorMode>();
    get onColorModeChanged(): Observable<ColorMode> {
        return this.colorModeChanged.asObservable();
    }

    constructor() {
        this._colorMode = this.readStoredColorMode();
        this.applyColorModeClass(this._colorMode);
    }

    setDeviceSize(): void {
        this._deviceSize = {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth <= 600,
        };
        this.deviceSizeChanged.next(this._deviceSize);
    }

    isMobileDevice(): boolean {
        const detector = new DeviceDetector();
        const device = detector.parse(window.navigator.userAgent);
        return device.device?.type === 'smartphone';
    }

    toggleColorMode(): void {
        const next: ColorMode = this._colorMode === 'LIGHT' ? 'DARK' : 'LIGHT';
        this._colorMode = next;
        this.applyColorModeClass(next);
        this.persistColorMode(next);
        this.colorModeChanged.next(next);
    }

    private readStoredColorMode(): ColorMode {
        if (typeof window === 'undefined' || !window.localStorage) return 'LIGHT';
        try {
            const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
            return stored === 'DARK' ? 'DARK' : 'LIGHT';
        } catch {
            return 'LIGHT';
        }
    }

    private persistColorMode(mode: ColorMode): void {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
        } catch {
            // localStorage may be disabled (private mode quota / SecurityError); ignore.
        }
    }

    private applyColorModeClass(mode: ColorMode): void {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        if (mode === 'DARK') root.classList.add(DARK_MODE_CLASS);
        else root.classList.remove(DARK_MODE_CLASS);
    }
}
