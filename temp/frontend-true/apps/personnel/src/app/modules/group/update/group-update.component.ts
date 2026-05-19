import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelGroupDTO, IPersonnelGroupUpdateRq, IPersonnelGroupUpdateRs } from '@lib/apis';
import { PersonnelGroup, PersonnelGroupInfo } from '@lib/shared';

@Component({
    host: { selector: 'group-update' },
    templateUrl: './group-update.component.html',
    styleUrl: './group-update.component.scss',
    standalone: false
})
export class GroupUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش گروه',
        inputs: [
            { type: 'COMMENT', title: 'نوع گروه', value: PersonnelGroupInfo[this.data.type].title },
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.group.title },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { type: PersonnelGroup; group: IPersonnelGroupDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.group.id;
        const body: IPersonnelGroupUpdateRq = {
            type: this.data.type,
            title: values['title'],
        };
        this.apiService.request<IPersonnelGroupUpdateRs>('PersonnelGroupUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
