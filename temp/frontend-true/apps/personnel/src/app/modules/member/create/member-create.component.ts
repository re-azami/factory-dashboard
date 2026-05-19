import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelGroupFullRs, IPersonnelMemberCreateRq, IPersonnelMemberCreateRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import {
    PersonnelGender,
    PersonnelGenderInfo,
    PersonnelGenderList,
    PersonnelMarital,
    PersonnelMaritalInfo,
    PersonnelMaritalList,
} from '@lib/shared';

@Component({
    host: { selector: 'member-create' },
    templateUrl: './member-create.component.html',
    styleUrl: './member-create.component.scss',
    standalone: false
})
export class MemberCreateComponent {
    public title: IPageTitle = { title: 'ثبت پرسنل جدید', actions: [{ type: 'RETURN', action: ['/member'] }] };

    private jalali = JalaliDateTime();
    public groups: IPersonnelGroupFullRs = this.activatedRoute.snapshot.data['groups'];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت پرسنل جدید',
        sections: [
            { columns: [{ name: 'name', type: 'NAME' }] },
            {
                columns: [
                    {
                        inputs: [
                            { name: 'code', type: 'NUMERIC', minLength: 4, maxLength: 4, title: 'کد پرسنلی' },
                            { name: 'department', type: 'SELECT', title: 'واحد', options: this.groups.department },
                            { name: 'position', type: 'SELECT', title: 'سمت', options: this.groups.position },
                            { name: 'employementDate', type: 'DATE', title: 'تاریخ استخدام', maxDate: new Date() },
                        ],
                    },
                    {
                        inputs: [
                            { name: 'nationalCode', type: 'NATIONAL-CODE' },
                            { name: 'mobile', type: 'MOBILE' },
                            {
                                name: 'education',
                                type: 'SELECT',
                                title: 'آخرین مدرک تحصیلی',
                                options: this.groups.education,
                            },
                            { name: 'fieldOfStudy', type: 'TEXT', title: 'رشته تحصیلی', optional: true },
                        ],
                    },
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
                                options: PersonnelGenderList.map((gender: PersonnelGender) => ({
                                    id: gender,
                                    title: PersonnelGenderInfo[gender].title,
                                })),
                            },
                            {
                                name: 'birthCertificate',
                                type: 'TEXT',
                                title: 'شماره شناسنامه',
                                english: true,
                                optional: true,
                            },
                            {
                                name: 'birthDate',
                                type: 'DATE',
                                title: 'تاریخ تولد',
                                maxDate: new this.jalali.modify().year(-18).toDate('END'),
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            { name: 'father', type: 'TEXT', title: 'نام پدر', optional: true },
                            { name: 'birthCertificateIssue', type: 'TEXT', title: 'محل صدور شناسنامه', optional: true },
                            { name: 'residence', type: 'TEXT', title: 'محل سکونت فعلی', optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'marital',
                                type: 'SELECT',
                                title: 'وضعیت تاهل',
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
                                minimum: 1,
                                maximum: 99,
                                optional: true,
                            },
                            {
                                name: 'children18',
                                type: 'NUMBER',
                                title: 'تعداد فرزند زیر ۱۸ سال',
                                minimum: 1,
                                maximum: 99,
                                optional: true,
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/member']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IPersonnelMemberCreateRq = {
            name: values['name'],
            code: values['code'],
            department: values['department'],
            position: values['position'],
            employementDate: values['employementDate'],
            nationalCode: values['nationalCode'],
            mobile: values['mobile'],
            education: values['education'],
            fieldOfStudy: values['fieldOfStudy'],
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
        this.apiService.request<IPersonnelMemberCreateRs>('PersonnelMemberCreate', { body }, (response) => {
            this.router.navigate(['/member', 'info', response.id]);
            this.ngxHelperToastService.success('پرسنل با موفقیت ثبت شد.');
        });
    }
}
