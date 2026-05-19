import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BarcodeFormat } from '@zxing/library';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue, NgxHelperParam } from '@webilix/ngx-helper/param';

import { ILoadDraftFlowDTO } from '@lib/apis';
import { LoadFlow, LoadFlowInfo } from '@lib/shared';

@Component({
    host: { selector: 'flow-scan' },
    templateUrl: './flow-scan.component.html',
    styleUrl: './flow-scan.component.scss',
    standalone: false,
})
export class FlowScanComponent {
    public params: NgxHelperParam[] = [];

    public formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
    public error: string = '';
    public devices: MediaDeviceInfo[] = [];
    public device?: MediaDeviceInfo;

    private lastId?: string;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { flow: LoadFlow; drafts: ILoadDraftFlowDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
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
        if (text.substring(0, 15) !== 'ESMIRAN DRAFT <') return;
        if (text.substring(text.length - 1) !== '>') return;

        const data: string = text.substring(15, text.length - 1);
        const [id, plate, code] = data.split('|');

        if (id === this.lastId) return;
        this.lastId = id;

        const draft = this.data.drafts.find((d) => d.id === id && d.plate === plate && d.code === code);
        if (draft) this.ngxHelperBottomSheetService.close({ id, plate, code });
        else {
            const flow: string = LoadFlowInfo[this.data.flow]?.title || '';
            const error: string = `حواله‌ای با مشخصات داده شده در مرحله ${flow} ثبت نشده است.`;
            this.ngxHelperToastService.error(error);
        }
    }

    cancel(): void {
        this.ngxHelperBottomSheetService.close();
    }
}
