import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';

import { ApiService, ILoadExportProceedingsLoadRq, ILoadExportProceedingsLoadRs } from '@lib/apis';
import { ConfigService, DeviceService } from '@lib/providers';

@Component({
    host: { selector: 'print-proceedings-load' },
    imports: [NgxFormModule],
    templateUrl: './print-proceedings-load.component.html',
    styleUrl: './print-proceedings-load.component.scss'
})
export class PrintProceedingsLoadComponent {
    public ngxForm: INgxForm = {
        submit: 'پرینت صورت جلسه آمار روزانه',
        inputs: [
            { name: 'date', type: 'DATE', value: new Date(), maxDate: new Date() },
            {
                name: 'type',
                type: 'SELECT',
                title: 'نوع بار',
                value: 'BOTH',
                options: [
                    { id: 'IN', title: 'ورودی' },
                    { id: 'OUT', title: 'خروجی' },
                    { id: 'BOTH', title: 'همه بارها' },
                ],
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadExportProceedingsLoadRq = { date: values['date'], type: values['type'] };
        this.apiService.request<ILoadExportProceedingsLoadRs>('LoadExportProceedingsLoad', { body }, (response) => {
            const url: string = this.configService.getApiUrl(response.path);

            if (!this.deviceService.isMobile()) this.ngxHelperHttpService.printPDF(url);
            else {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, url);
            }
            this.ngxHelperBottomSheetService.close();
        });
    }
}
