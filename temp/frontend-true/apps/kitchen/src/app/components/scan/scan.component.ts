import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { MatButton } from '@angular/material/button';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { INgxHelperParamValue, NgxHelperParam, NgxHelperParamModule } from '@webilix/ngx-helper/param';

import { ApiService, IKitchenServingBarcodeRs } from '@lib/apis';
import { KitchenMeal, KitchenMealList } from '@lib/shared';

@Component({
    host: { selector: 'scan' },
    imports: [NgStyle, MatButton, ZXingScannerModule, NgxHelperParamModule],
    templateUrl: './scan.component.html',
    styleUrl: './scan.component.scss',
})
export class ScanComponent {
    public params: NgxHelperParam[] = [];

    public formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
    public error: string = '';
    public devices: MediaDeviceInfo[] = [];
    public device?: MediaDeviceInfo;

    private lastId?: string;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    permissionResponse(result: boolean): void {
        if (!result && !this.error) this.error = 'دسترسی دوربین اختصاص داده نشده است.';
    }

    hasDevices(result: boolean): void {
        if (!result && !this.error) this.error = 'دوربین‌ فعال در سیستم وجود ندارد.';
    }

    camerasNotFound(): void {
        if (!this.error) this.error = 'امکان تشخیص دوربین وجود ندارد.';
    }

    camerasFound(devices: MediaDeviceInfo[]): void {
        this.devices = devices;
        this.device = devices[0];
        this.params = [
            {
                name: 'device',
                type: 'SELECT',
                title: 'دوربین',
                icon: 'videocam',
                options: devices.map((d) => ({ id: d.deviceId, title: d.label })),
                value: devices[0].deviceId,
                english: true,
                required: true,
            },
        ];
    }

    setCamera(value: INgxHelperParamValue): void {
        const device: string = value.params['device']?.param || '';
        this.device = this.devices.find((d) => d.deviceId === device);
    }

    scanSuccess(text: string): void {
        if (text.substring(0, 17) !== 'ESMIRAN SERVING <') return;
        if (text.substring(text.length - 1) !== '>') return;

        const data: string = text.substring(17, text.length - 1);
        const [jalali, meal, id] = data.split('|');
        if (
            !Helper.RE.DATE.verify(jalali) ||
            !KitchenMealList.includes(meal as KitchenMeal) ||
            !Helper.IS.STRING.objectId(id)
        )
            return;

        if (id === this.lastId) return;
        this.lastId = id;

        this.apiService.request<IKitchenServingBarcodeRs>(
            'KitchenServingBarcode',
            { params: { jalali, meal } },
            (response) => {
                this.router.navigate(['/calendar', response.id]);
                this.close();
            },
        );
    }

    close(): void {
        this.ngxHelperBottomSheetService.close();
    }
}
