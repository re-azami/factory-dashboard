import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperHttpService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelExportMemberRq, IPersonnelExportMemberRs, IPersonnelGroupFullRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import {
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
    PersonnelGender,
    PersonnelGenderInfo,
    PersonnelGenderList,
    PersonnelMarital,
    PersonnelMaritalInfo,
    PersonnelMaritalList,
    PersonnelStatus,
    PersonnelStatusInfo,
    PersonnelStatusList,
} from '@lib/shared';

@Component({
    host: { selector: 'export' },
    templateUrl: './export.component.html',
    styleUrl: './export.component.scss',
    standalone: false
})
export class ExportComponent {
    public title: IPageTitle = { title: 'دانلود لیست پرسنل' };

    public groups: IPersonnelGroupFullRs = this.activatedRoute.snapshot.data['groups'];

    public ngxForm: INgxResponsiveForm = {
        submit: 'دانلود لیست پرسنل',
        sections: [
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'status',
                                type: 'SELECT',
                                title: 'وضعیت استخدام',
                                value: 'ACTIVE',
                                options: PersonnelStatusList.map((status: PersonnelStatus) => ({
                                    id: status,
                                    title: PersonnelStatusInfo[status].title,
                                })),
                                optional: true,
                            },
                            {
                                name: 'department',
                                type: 'SELECT',
                                title: 'واحد',
                                options: this.groups.department,
                                optional: true,
                            },
                            {
                                name: 'position',
                                type: 'SELECT',
                                title: 'سمت',
                                options: this.groups.position,
                                optional: true,
                            },
                            { name: 'age', type: 'RANGE', title: 'سن', optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'education',
                                type: 'SELECT',
                                title: 'آخرین مدرک تحصیلی',
                                options: this.groups.education,
                                optional: true,
                            },
                            {
                                name: 'gender',
                                type: 'SELECT',
                                title: 'جنسیت',
                                options: PersonnelGenderList.map((gender: PersonnelGender) => ({
                                    id: gender,
                                    title: PersonnelGenderInfo[gender].title,
                                })),
                                optional: true,
                            },
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
                            { name: 'children18', type: 'CHECKBOX', message: 'داری فرزند زیر ۱۸ سال' },
                        ],
                    },
                    { inputs: [] },
                ],
            },
            {
                columns: [
                    {
                        name: 'type',
                        type: 'SELECT',
                        title: 'نوع خروجی',
                        options: ExportTypeList.map((type: ExportType) => ({ id: type, title: ExportTypeInfo[type].title })),
                    },
                ],
            },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IPersonnelExportMemberRq = {
            status: values['status'],
            department: values['department'],
            position: values['position'],
            gender: values['gender'],
            marital: values['marital'],
            education: values['education'],
            age: { minimum: values['age'][0], maximum: values['age'][1] },
            children18: values['children18'],
            type: values['type'],
        };
        this.apiService.request<IPersonnelExportMemberRs>('PersonnelExportMember', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
