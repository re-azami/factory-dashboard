import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ISettingEducationRq, ISettingEducationRs } from '@lib/apis';
import { SettingService } from '@lib/providers';

@Component({
    host: { selector: 'setting' },
    imports: [NgxFormModule],
    templateUrl: './setting.component.html',
    styleUrl: './setting.component.scss'
})
export class SettingComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت تنظیمات',
        inputs: [
            {
                name: 'date',
                type: 'SELECT',
                title: 'تاریخ اصلی برگزاری دوره',
                value: this.settingService.education.date,
                options: [
                    { id: 'FIRST', title: 'اولین تاریخ برگزاری دوره' },
                    { id: 'LAST', title: 'آخرین تاریخ برگزاری دوره' },
                ],
                description:
                    'با توجه به امکان انتخاب بیش از یک تاریخ برگزاری برای دوره، با استفاده از این گزینه ' +
                    'می‌توانید تاریخ اصلی برگزاری دوره را مشخص کنید. از این تاریخ برای محاسبه اطلاعات در گزارش‌های سیستم استفاده می‌شود.',
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly settingService: SettingService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ISettingEducationRq = {
            date: values['date'],
        };
        this.apiService.request<ISettingEducationRs>('SettingEducation', { body }, (response) => {
            this.settingService.init(response);
            this.ngxHelperToastService.success('تنظیمات سیستم با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
