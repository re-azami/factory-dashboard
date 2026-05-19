import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelMemberDTO, IPersonnelMemberUpdateRq, IPersonnelMemberUpdateRs } from '@lib/apis';
import {
    PersonnelGender,
    PersonnelGenderInfo,
    PersonnelGenderList,
    PersonnelMarital,
    PersonnelMaritalInfo,
    PersonnelMaritalList,
} from '@lib/shared';

@Component({
    selector: 'member-update',
    templateUrl: './member-update.component.html',
    styleUrl: './member-update.component.scss',
    standalone: false
})
export class MemberUpdateComponent implements OnInit {
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    private jalali = JalaliDateTime();
    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش مشخصات',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            { columns: [{ name: 'name', type: 'NAME', value: this.member.name }] },
            {
                columns: [
                    { inputs: [{ name: 'nationalCode', type: 'NATIONAL-CODE', value: this.member.nationalCode }] },
                    { inputs: [{ name: 'mobile', type: 'MOBILE', value: this.member.mobile }] },
                ],
            },
            {
                title: 'اطلاعات شخصی',
                columns: [
                    {
                        inputs: [
                            {
                                name: 'gender',
                                type: 'SELECT',
                                title: 'جنسیت',
                                value: this.member.gender,
                                options: PersonnelGenderList.map((gender: PersonnelGender) => ({
                                    id: gender,
                                    title: PersonnelGenderInfo[gender].title,
                                })),
                            },
                            {
                                name: 'birthCertificate',
                                type: 'TEXT',
                                title: 'شماره شناسنامه',
                                value: this.member.birthCertificate,
                                english: true,
                                optional: true,
                            },
                            {
                                name: 'birthDate',
                                type: 'DATE',
                                title: 'تاریخ تولد',
                                value: this.member.birthDate,
                                maxDate: new this.jalali.modify().year(-18).toDate('END'),
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'father',
                                type: 'TEXT',
                                title: 'نام پدر',
                                value: this.member.father,
                                optional: true,
                            },
                            {
                                name: 'birthCertificateIssue',
                                type: 'TEXT',
                                title: 'محل صدور شناسنامه',
                                value: this.member.birthCertificateIssue,
                                optional: true,
                            },
                            {
                                name: 'residence',
                                type: 'TEXT',
                                title: 'محل سکونت فعلی',
                                value: this.member.residence,
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'marital',
                                type: 'SELECT',
                                title: 'وضعیت تاهل',
                                value: this.member.marital,
                                options: PersonnelMaritalList.map((marital: PersonnelMarital) => ({
                                    id: marital,
                                    title: PersonnelMaritalInfo[marital].title,
                                })),
                                optional: true,
                            },
                            {
                                name: 'children',
                                type: 'NUMBER',
                                title: 'تعداد فرزند',
                                value: this.member.children,
                                minimum: 1,
                                maximum: 99,
                                optional: true,
                            },
                            {
                                name: 'children18',
                                type: 'NUMBER',
                                title: 'تعداد فرزند زیر ۱۸ سال',
                                value: this.member.children18,
                                minimum: 1,
                                maximum: 99,
                                optional: true,
                            },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.member.id;
        const body: IPersonnelMemberUpdateRq = {
            name: values['name'],
            nationalCode: values['nationalCode'],
            mobile: values['mobile'],
            gender: values['gender'],
            birthCertificate: values['birthCertificate'],
            birthDate: values['birthDate'],
            father: values['father'],
            birthCertificateIssue: values['birthCertificateIssue'],
            residence: values['residence'],
            marital: values['marital'],
            children: values['children'],
            children18: values['children18'],
        };
        this.apiService.request<IPersonnelMemberUpdateRs>('PersonnelMemberUpdate', { body, ids: { ID } }, (response) => {
            this.updated.emit(response);
            this.ngxHelperToastService.success('ویرایش مشخصات با موفقیت ثبت شد.');
        });
    }
}
