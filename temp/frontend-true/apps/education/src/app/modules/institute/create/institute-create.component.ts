import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationInstituteCreateRq, IEducationInstituteCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'institute-create' },
    templateUrl: './institute-create.component.html',
    styleUrl: './institute-create.component.scss',
    standalone: false
})
export class InstituteCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت موسسه جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            [
                { name: 'ceo-name', type: 'TEXT', title: 'نام مدیرعامل', optional: true },
                { name: 'ceo-mobile', type: 'MOBILE', title: 'موبایل مدیرعامل', optional: true },
            ],
            [
                { name: 'introducer-name', type: 'TEXT', title: 'نام معرف', optional: true },
                { name: 'introducer-mobile', type: 'MOBILE', title: 'موبایل معرف', optional: true },
            ],
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IEducationInstituteCreateRq = {
            title: values['title'],
            ceo: { name: values['ceo-name'], mobile: values['ceo-mobile'] },
            introducer: { name: values['introducer-name'], mobile: values['introducer-mobile'] },
        };
        this.apiService.request<IEducationInstituteCreateRs>('EducationInstituteCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
