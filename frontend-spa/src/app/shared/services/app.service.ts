import { Injectable } from '@angular/core';
import DeviceDetector from 'device-detector-js';
import { Observable, Subject } from 'rxjs';

import { IDeviceSize } from '../interfaces/device-size';

/**
 * Minimal app-level service: tracks device size only.
 *
 * The reference frontend (temp/frontend-true) splits this across several
 * providers — DeviceService, ConfigService, VersionService — most of which
 * depend on backend APIs we do not implement. We keep just the
 * infrastructure piece (deviceSize) here. No color-mode logic; light-only
 * for UI-001a (dark mode is deferred to UI-001a-dark).
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
}
