import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadTransporterCreateRq, ILoadTransporterCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'transporter-create' },
    templateUrl: './transporter-create.component.html',
    styleUrl: './transporter-create.component.scss',
    standalone: false
})
export class TransporterCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت باربری جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true },
            { name: 'code', type: 'TEXT', title: 'کد باربری', optional: true, english: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadTransporterCreateRq = {
            title: values['title'],
            code: values['code'],
        };
        this.apiService.request<ILoadTransporterCreateRs>('LoadTransporterCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
