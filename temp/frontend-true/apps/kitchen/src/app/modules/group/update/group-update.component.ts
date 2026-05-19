import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGroupDTO, IKitchenGroupUpdateRq, IKitchenGroupUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'group-update' },
    standalone: false,
    templateUrl: './group-update.component.html',
    styleUrl: './group-update.component.scss',
})
export class GroupUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش گروه',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.group.title, autoFocus: true }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: IKitchenGroupDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.group.id;
        const body: IKitchenGroupUpdateRq = {
            title: values['title'],
        };
        this.apiService.request<IKitchenGroupUpdateRs>('KitchenGroupUpdate', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
