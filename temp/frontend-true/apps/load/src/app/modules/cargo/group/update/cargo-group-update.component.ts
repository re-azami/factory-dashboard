import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoGroupDTO, ILoadCargoGroupUpdateRq, ILoadCargoGroupUpdateRs } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'cargo-group-update' },
    templateUrl: './cargo-group-update.component.html',
    styleUrl: './cargo-group-update.component.scss',
    standalone: false
})
export class CargoGroupUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش گروه حواله',
        inputs: [
            {
                type: 'COMMENT',
                title: 'بار',
                value: this.data.cargo.title,
                description: LoadCargoInfo[this.data.cargo.type].title,
            },
            { name: 'title', type: 'TEXT', title: 'عنوان گروه', value: this.data.group.title, autoFocus: true },
            [
                {
                    name: 'first',
                    type: 'TEXT',
                    title: 'شماره اولین حواله',
                    value: this.data.group.first.code,
                    english: true,
                    maxLength: 11,
                },
                {
                    name: 'last',
                    type: 'TEXT',
                    title: 'شماره آخرین حواله',
                    value: this.data.group.last.code,
                    english: true,
                    maxLength: 11,
                },
            ],
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', value: this.data.group.description, optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILoadCargoDTO; group: ILoadCargoGroupDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    public ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const GROUPID: string = this.data.group.id;
        const body: ILoadCargoGroupUpdateRq = {
            title: values['title'],
            first: values['first'],
            last: values['last'],
            description: values['description'],
        };
        this.apiService.request<ILoadCargoGroupUpdateRs>('LoadCargoGroupUpdate', { body, ids: { ID, GROUPID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
