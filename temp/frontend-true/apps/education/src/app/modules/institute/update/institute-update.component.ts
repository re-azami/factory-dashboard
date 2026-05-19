import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationInstituteDTO, IEducationInstituteUpdateRq, IEducationInstituteUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'institute-update' },
    templateUrl: './institute-update.component.html',
    styleUrl: './institute-update.component.scss',
    standalone: false
})
export class InstituteUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش موسسه',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.institute.title },
            [
                {
                    name: 'ceo-name',
                    type: 'TEXT',
                    title: 'نام مدیرعامل',
                    value: this.data.institute.ceo.name,
                    optional: true,
                },
                {
                    name: 'ceo-mobile',
                    type: 'MOBILE',
                    title: 'موبایل مدیرعامل',
                    value: this.data.institute.ceo.mobile,
                    optional: true,
                },
            ],
            [
                {
                    name: 'introducer-name',
                    type: 'TEXT',
                    title: 'نام معرف',
                    value: this.data.institute.introducer.name,
                    optional: true,
                },
                {
                    name: 'introducer-mobile',
                    type: 'MOBILE',
                    title: 'موبایل معرف',
                    value: this.data.institute.introducer.mobile,
                    optional: true,
                },
            ],
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { institute: IEducationInstituteDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.institute.id;
        const body: IEducationInstituteUpdateRq = {
            title: values['title'],
            ceo: { name: values['ceo-name'], mobile: values['ceo-mobile'] },
            introducer: { name: values['introducer-name'], mobile: values['introducer-mobile'] },
        };
        this.apiService.request<IEducationInstituteUpdateRs>('EducationInstituteUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
