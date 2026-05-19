import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILoadCheckoutCargoRs,
    ILoadCheckoutDownloadRq,
    ILoadCheckoutDownloadRs,
    ILoadCheckoutDTO,
} from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

@Component({
    host: { selector: 'checkout-download' },
    templateUrl: './checkout-download.component.html',
    styleUrl: './checkout-download.component.scss',
    standalone: false
})
export class CheckoutDownloadComponent implements OnInit {
    public loading: boolean = true;

    private periodPipe = new NgxHelperPeriodPipe();
    public ngxForm: INgxForm = {
        submit: 'دانلود لیست',
        inputs: [
            [
                {
                    type: 'COMMENT',
                    title: 'دوره زمانی',
                    value: this.periodPipe.transform({ from: this.data.checkout.date.from, to: this.data.checkout.date.to }),
                },
                { type: 'COMMENT', title: 'رسید پرداخت', value: this.data.checkout.code, english: true },
            ],
            [
                { type: 'COMMENT', title: 'تعداد بار', value: Helper.NUMBER.format(this.data.checkout.count.cargo) },
                { type: 'COMMENT', title: 'تعداد مالک', value: Helper.NUMBER.format(this.data.checkout.count.owner) },
                { type: 'COMMENT', title: 'تعداد حواله', value: Helper.NUMBER.format(this.data.checkout.count.draft) },
            ],
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { checkout: ILoadCheckoutDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.checkout.id;
        this.apiService.request<ILoadCheckoutCargoRs>('LoadCheckoutCargo', { ids: { ID } }, (response) => {
            this.loading = false;

            this.ngxForm.inputs.push(
                {
                    name: 'cargo',
                    type: 'MULTI-SELECT',
                    title: 'بار',
                    options: response,
                    value: response.map((r) => r.id),
                    selectButtons: true,
                    minCount: 1,
                },
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع خروجی',
                    value: 'EXCEL',
                    options: ExportTypeList.map((type: ExportType) => ({ id: type, title: ExportTypeInfo[type].title })),
                },
            );
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.checkout.id;
        const body: ILoadCheckoutDownloadRq = {
            cargo: values['cargo'] === 'ALL' ? null : values['cargo'],
            type: values['type'],
        };
        this.apiService.request<ILoadCheckoutDownloadRs>('LoadCheckoutDownload', { body, ids: { ID } }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));

            this.ngxHelperBottomSheetService.close();
        });
    }
}
