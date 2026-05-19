import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoStatusRq, ILoadCargoStatusRs } from '@lib/apis';
import { LoadStatus, LoadStatusInfo, LoadStatusList } from '@lib/shared';

@Component({
    host: { selector: 'cargo-status' },
    templateUrl: './cargo-status.component.html',
    styleUrl: './cargo-status.component.scss',
    standalone: false
})
export class CargoStatusComponent {
    public prior?: string = this.data.cargo.status === 'FUTURE' ? this.data.cargo.prior?.title : undefined;
    public ngxForm: INgxForm = {
        submit: 'تغییر وضعیت بار',
        inputs: [
            { type: 'COMMENT', title: 'بار', value: this.data.cargo.title },
            [
                { type: 'COMMENT', title: 'وضعیت فعلی', value: LoadStatusInfo[this.data.cargo.status].title },
                {
                    name: 'status',
                    type: 'SELECT',
                    title: 'وضعیت جدید',
                    options: LoadStatusList.filter((status: LoadStatus) => status !== this.data.cargo.status).map(
                        (status: LoadStatus) => ({ id: status, title: LoadStatusInfo[status].title }),
                    ),
                },
            ],
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILoadCargoDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const body: ILoadCargoStatusRq = {
            status: values['status'],
            description: values['description'],
        };
        this.apiService.request<ILoadCargoStatusRs>('LoadCargoStatus', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
