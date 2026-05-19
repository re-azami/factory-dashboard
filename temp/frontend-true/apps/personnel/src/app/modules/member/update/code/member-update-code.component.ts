import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelMemberDTO, IPersonnelMemberUpdateCodeRq, IPersonnelMemberUpdateCodeRs } from '@lib/apis';

@Component({
    selector: 'member-update-code',
    templateUrl: './member-update-code.component.html',
    styleUrl: './member-update-code.component.scss',
    standalone: false
})
export class MemberUpdateCodeComponent implements OnInit {
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر کد پرسنلی',
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
                            { type: 'COMMENT', title: 'کد پرسنلی فعلی', value: this.member.code, english: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'code',
                                type: 'NUMERIC',
                                minLength: 4,
                                maxLength: 4,
                                title: 'کد پرسنلی جدید',
                                autoFocus: true,
                            },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.member.code === values['code']) {
            this.ngxHelperToastService.error('کد پرسنلی جدید نمی‌تواند برابر با مقدار فعلی باشد.');
            return;
        }

        const ID: string = this.member.id;
        const body: IPersonnelMemberUpdateCodeRq = {
            code: values['code'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberUpdateCodeRs>(
            'PersonnelMemberUpdateCode',
            { body, ids: { ID } },
            (response) => {
                this.updated.emit(response);
                this.ngxHelperToastService.success('تغییر کد پرسنلی با موفقیت ثبت شد.');
            },
        );
    }
}
