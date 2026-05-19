import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportGroupDTO, ITransportGroupUpdateRq, ITransportGroupUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'group-update' },
    templateUrl: './group-update.component.html',
    styleUrls: ['./group-update.component.scss'],
    standalone: false
})
export class GroupUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش گروه مکان',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.group.title }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: ITransportGroupDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.group.id;
        const body: ITransportGroupUpdateRq = {
            title: values['title'],
        };
        this.apiService.request<ITransportGroupUpdateRs>('TransportGroupUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
