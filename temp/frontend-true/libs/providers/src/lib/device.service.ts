import { Injectable } from '@angular/core';
import DeviceDetecror from 'device-detector-js';
import { Observable, Subject } from 'rxjs';

export interface IDeviceSize {
    width: number;
    height: number;
    isMobile: boolean;
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
    private _size: IDeviceSize = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 600,
    };
    get size(): IDeviceSize {
        return this._size;
    }

    private sizeChanged: Subject<IDeviceSize> = new Subject<IDeviceSize>();
    get onSizeChanged(): Observable<IDeviceSize> {
        return this.sizeChanged.asObservable();
    }

    setSize(): void {
        this._size = {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth <= 600,
        };
        this.sizeChanged.next(this._size);
    }

    private type(): string {
        const deviceDetecror = new DeviceDetecror();
        const device = deviceDetecror.parse(window.navigator.userAgent);

        if (device.device?.type === 'smartphone') return 'MOBILE';
        if (device.device?.type === 'tablet') return 'TABLET';
        if (device.device?.type === 'desktop') return 'DESKTOP';
        return 'UNKNOWN';
    }

    isMobile(): boolean {
        return this.type() === 'MOBILE';
    }
}
