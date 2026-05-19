import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ISettingWarehouseRq, ISettingWarehouseRs } from '@lib/apis';
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
                name: 'dash',
                type: 'CHECKBOX',
                message: 'استفاده از کاراکتر منها (-) در نمایش کد کالا',
                value: this.settingService.warehouse.dash,
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly settingService: SettingService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ISettingWarehouseRq = {
            dash: values['dash'],
        };
        this.apiService.request<ISettingWarehouseRs>('SettingWarehouse', { body }, (response) => {
            this.settingService.init(response);
            this.ngxHelperToastService.success('تنظیمات سیستم با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
