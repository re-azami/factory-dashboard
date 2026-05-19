import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelGroupCreateRq, IPersonnelGroupCreateRs } from '@lib/apis';
import { PersonnelGroup, PersonnelGroupInfo } from '@lib/shared';

@Component({
    host: { selector: 'group-create' },
    templateUrl: './group-create.component.html',
    styleUrl: './group-create.component.scss',
    standalone: false
})
export class GroupCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت گروه جدید',
        inputs: [
            { type: 'COMMENT', title: 'نوع گروه', value: PersonnelGroupInfo[this.data.type].title },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { type: PersonnelGroup },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IPersonnelGroupCreateRq = {
            type: this.data.type,
            title: values['title'],
        };
        this.apiService.request<IPersonnelGroupCreateRs>('PersonnelGroupCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
