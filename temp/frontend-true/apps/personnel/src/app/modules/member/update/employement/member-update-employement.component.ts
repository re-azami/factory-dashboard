import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelMemberDTO,
    IPersonnelMemberEmployementDateRq,
    IPersonnelMemberEmployementDateRs,
} from '@lib/apis';

@Component({
    selector: 'member-update-employement',
    templateUrl: './member-update-employement.component.html',
    styleUrl: './member-update-employement.component.scss',
    standalone: false
})
export class MemberUpdateEmployementComponent implements OnInit {
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    private jalali = JalaliDateTime();
    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر تاریخ استخدام',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            { type: 'COMMENT', title: 'پرسنل', value: `${this.member.name.first} ${this.member.name.last}` },
                            {
                                type: 'COMMENT',
                                title: 'تاریخ استخدام فعلی',
                                value: this.jalali.toTitle(this.member.employement.date),
                            },
                        ],
                    },
                    {
                        inputs: [
                            { name: 'employementDate', type: 'DATE', title: 'تاریخ استخدام جدید', maxDate: new Date() },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.jalali.toDate(this.member.employement.date) === this.jalali.toDate(values['employementDate'])) {
            this.ngxHelperToastService.error('تاریخ جدید نمی‌تواند برابر با مقدار فعلی باشد.');
            return;
        }

        const MEMBERID: string = this.member.id;
        const body: IPersonnelMemberEmployementDateRq = {
            employementDate: values['employementDate'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberEmployementDateRs>(
            'PersonnelMemberEmployementDate',
            { body, ids: { MEMBERID } },
            (response) => {
                this.updated.emit(response);
                this.ngxHelperToastService.success('تغییر تاریخ استخدام با موفقیت ثبت شد.');
            },
        );
    }
}
