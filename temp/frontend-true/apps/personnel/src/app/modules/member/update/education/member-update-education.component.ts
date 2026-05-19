import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelGroupFullRs,
    IPersonnelMemberDTO,
    IPersonnelMemberUpdateEducationRq,
    IPersonnelMemberUpdateEducationRs,
} from '@lib/apis';

@Component({
    selector: 'member-update-education',
    templateUrl: './member-update-education.component.html',
    styleUrl: './member-update-education.component.scss',
    standalone: false
})
export class MemberUpdateEducationComponent implements OnInit {
    @Input({ required: true }) groups!: IPersonnelGroupFullRs;
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر مدرک تحصیلی',
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
                                title: 'مدرک فعلی',
                                value: this.member.education.title,
                                description: this.member.fieldOfStudy,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'education',
                                type: 'SELECT',
                                title: 'آخرین مدرک تحصیلی',
                                options: this.groups.education.filter((e) => e.id !== this.member.education?.id),
                            },
                            {
                                name: 'fieldOfStudy',
                                type: 'TEXT',
                                title: 'رشته تحصیلی',
                                value: this.member.fieldOfStudy,
                                optional: true,
                            },
                            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (
            this.member.education.id === values['education'] &&
            (this.member.fieldOfStudy || '') === (values['fieldOfStudy'] || '')
        ) {
            this.ngxHelperToastService.error('آخرین مدرک تحصیلی و رشته تحصیلی نمی‌توانند برابر با مقدارهای فعلی باشند.');
            return;
        }

        const ID: string = this.member.id;
        const body: IPersonnelMemberUpdateEducationRq = {
            education: values['education'],
            fieldOfStudy: values['fieldOfStudy'],
            description: values['description'],
        };
        this.apiService.request<IPersonnelMemberUpdateEducationRs>(
            'PersonnelMemberUpdateEducation',
            { body, ids: { ID } },
            (response) => {
                this.updated.emit(response);
                this.ngxHelperToastService.success('تغییر مدرک تحصیلی با موفقیت ثبت شد.');
            },
        );
    }
}
