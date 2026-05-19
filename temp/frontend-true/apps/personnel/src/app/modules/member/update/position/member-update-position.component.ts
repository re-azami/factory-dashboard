import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelGroupFullRs,
    IPersonnelMemberDTO,
    IPersonnelMemberUpdatePositionRq,
    IPersonnelMemberUpdatePositionRs,
} from '@lib/apis';

@Component({
    selector: 'member-update-position',
    templateUrl: './member-update-position.component.html',
    styleUrl: './member-update-position.component.scss',
    standalone: false
})
export class MemberUpdatePositionComponent implements OnInit {
    @Input({ required: true }) groups!: IPersonnelGroupFullRs;
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر سمت',
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
                            { type: 'COMMENT', title: 'سمت فعلی', value: this.member.position.title },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'position',
                                type: 'SELECT',
                                title: 'سمت جدید',
                                options: this.groups.position.filter((p) => p.id !== this.member.position.id),
                            },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.member.position.id === values['position']) {
            this.ngxHelperToastService.error('سمت جدید نمی‌تواند برابر با مقدار فعلی باشد.');
            return;
        }

        const ID: string = this.member.id;
        const body: IPersonnelMemberUpdatePositionRq = {
            position: values['position'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberUpdatePositionRs>(
            'PersonnelMemberUpdatePosition',
            { body, ids: { ID } },
            (response) => {
                this.updated.emit(response);
                this.ngxHelperToastService.success('تغییر سمت با موفقیت ثبت شد.');
            },
        );
    }
}
