import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadMiscDTO, ILoadMiscUpdateRq, ILoadMiscUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'misc-update' },
    templateUrl: './misc-update.component.html',
    styleUrl: './misc-update.component.scss',
    standalone: false
})
export class MiscUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش محموله متفرقه',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.misc.title, autoFocus: true },
            { name: 'unit', type: 'TEXT', title: 'واحد', value: this.data.misc.unit, optional: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', value: this.data.misc.description, optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { misc: ILoadMiscDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.misc.id;
        const body: ILoadMiscUpdateRq = {
            title: values['title'],
            unit: values['unit'],
            description: values['description'],
        };
        this.apiService.request<ILoadMiscUpdateRs>('LoadMiscUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
