import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelGroupFullRs,
    IPersonnelMemberDTO,
    IPersonnelMemberUpdateDepartmentRq,
    IPersonnelMemberUpdateDepartmentRs,
} from '@lib/apis';

@Component({
    selector: 'member-update-department',
    templateUrl: './member-update-department.component.html',
    styleUrl: './member-update-department.component.scss',
    standalone: false
})
export class MemberUpdateDepartmentComponent implements OnInit {
    @Input({ required: true }) groups!: IPersonnelGroupFullRs;
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر واحد',
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
                            { type: 'COMMENT', title: 'واحد فعلی', value: this.member.department.title },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'department',
                                type: 'SELECT',
                                title: 'واحد جدید',
                                options: this.groups.department.filter((d) => d.id !== this.member.department.id),
                            },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.member.department.id === values['department']) {
            this.ngxHelperToastService.error('واحد جدید نمی‌تواند برابر با مقدار فعلی باشد.');
            return;
        }

        const ID: string = this.member.id;
        const body: IPersonnelMemberUpdateDepartmentRq = {
            department: values['department'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberUpdateDepartmentRs>(
            'PersonnelMemberUpdateDepartment',
            { body, ids: { ID } },
            (response) => {
                this.updated.emit(response);
                this.ngxHelperToastService.success('تغییر واحد با موفقیت ثبت شد.');
            },
        );
    }
}
