import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoGroupCreateRq, ILoadCargoGroupCreateRs } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'cargo-group-create' },
    templateUrl: './cargo-group-create.component.html',
    styleUrl: './cargo-group-create.component.scss',
    standalone: false
})
export class CargoGroupCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت گروه حواله',
        inputs: [
            {
                type: 'COMMENT',
                title: 'بار',
                value: this.data.cargo.title,
                description: LoadCargoInfo[this.data.cargo.type].title,
            },
            { name: 'title', type: 'TEXT', title: 'عنوان گروه', autoFocus: true },
            [
                { name: 'first', type: 'TEXT', title: 'شماره اولین حواله', english: true, maxLength: 11 },
                { name: 'last', type: 'TEXT', title: 'شماره آخرین حواله', english: true, maxLength: 11 },
            ],
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILoadCargoDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    public ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const body: ILoadCargoGroupCreateRq = {
            title: values['title'],
            first: values['first'],
            last: values['last'],
            description: values['description'],
        };
        this.apiService.request<ILoadCargoGroupCreateRs>('LoadCargoGroupCreate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
