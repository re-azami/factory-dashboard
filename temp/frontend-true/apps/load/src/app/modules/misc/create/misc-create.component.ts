import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadMiscCreateRq, ILoadMiscCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'misc-create' },
    templateUrl: './misc-create.component.html',
    styleUrl: './misc-create.component.scss',
    standalone: false
})
export class MiscCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت محموله متفرقه جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', autoFocus: true },
            { name: 'unit', type: 'TEXT', title: 'واحد', optional: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadMiscCreateRq = {
            title: values['title'],
            unit: values['unit'],
            description: values['description'],
        };
        this.apiService.request<ILoadMiscCreateRs>('LoadMiscCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
