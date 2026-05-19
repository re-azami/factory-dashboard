import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelMemberDTO,
    IPersonnelMemberEmployementActiveRq,
    IPersonnelMemberEmployementActiveRs,
} from '@lib/apis';

@Component({
    host: { selector: 'member-status-active' },
    templateUrl: './member-status-active.component.html',
    styleUrl: './member-status-active.component.scss',
    standalone: false
})
export class MemberStatusActiveComponent {
    private lastChange: Date = new Date(
        (this.data.member.employement.logs.length !== 0
            ? this.data.member.employement.logs[this.data.member.employement.logs.length - 1].date
            : this.data.member.employement.date
        ).getTime() +
            24 * 3600 * 1000,
    );
    public ngxForm: INgxForm = {
        submit: 'غیرفعال کردن وضعیت استخدام',
        inputs: [
            { type: 'COMMENT', title: 'پرسنل', value: `${this.data.member.name.first} ${this.data.member.name.last}` },
            { name: 'date', type: 'DATE', minDate: this.lastChange, maxDate: new Date() },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { member: IPersonnelMemberDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const MEMBERID: string = this.data.member.id;
        const body: IPersonnelMemberEmployementActiveRq = {
            date: values['date'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberEmployementActiveRs>(
            'PersonnelMemberEmployementActive',
            { body, ids: { MEMBERID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
