import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ISettingSupportRq, ISettingSupportRs } from '@lib/apis';
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
                name: 'inform',
                type: 'LIST',
                title: 'اطلاع رسانی درخواست',
                format: 'MOBILE',
                value: this.settingService.support.inform,
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
        const body: ISettingSupportRq = {
            inform: values['inform'],
        };
        this.apiService.request<ISettingSupportRs>('SettingSupport', { body }, (response) => {
            this.settingService.init(response);
            this.ngxHelperToastService.success('تنظیمات سیستم با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
