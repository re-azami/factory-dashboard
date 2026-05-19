import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadTransporterDTO, ILoadTransporterUpdateRq, ILoadTransporterUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'transporter-update' },
    templateUrl: './transporter-update.component.html',
    styleUrl: './transporter-update.component.scss',
    standalone: false
})
export class TransporterUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش باربری',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.transporter.title, autoFocus: true },
            {
                name: 'code',
                type: 'TEXT',
                title: 'کد باربری',
                value: this.data.transporter.code,
                optional: true,
                english: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { transporter: ILoadTransporterDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.transporter.id;
        const body: ILoadTransporterUpdateRq = {
            title: values['title'],
            code: values['code'],
        };
        this.apiService.request<ILoadTransporterUpdateRs>('LoadTransporterUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
