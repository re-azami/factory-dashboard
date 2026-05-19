import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IDraftDailySetting, LoadToolsService } from '../../../../providers';

@Component({
    host: { selector: 'draft-daily-setting' },
    templateUrl: './draft-daily-setting.component.html',
    styleUrl: './draft-daily-setting.component.scss',
    standalone: false
})
export class DraftDailySettingComponent {
    private setting: IDraftDailySetting = this.loadToolsService.dailySetting;
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            {
                name: 'hidden',
                type: 'MULTI-SELECT',
                title: 'نمایش ستون‌ها',
                value: [
                    this.setting.hidden.party ? '' : 'PARTY',
                    this.setting.hidden.shipment ? '' : 'SHIPMENT',
                    this.setting.hidden.transporter ? '' : 'TRANSPORTER',
                    this.setting.hidden.driver ? '' : 'DRIVER',
                    this.setting.hidden.mobile ? '' : 'MOBILE',
                ],
                options: [
                    { id: 'PARTY', title: 'طرف حساب' },
                    { id: 'SHIPMENT', title: 'محموله' },
                    { id: 'TRANSPORTER', title: 'باربری' },
                    { id: 'DRIVER', title: 'راننده' },
                    { id: 'MOBILE', title: 'موبایل' },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const setting: IDraftDailySetting = {
            hidden: {
                party: !values['hidden'].includes('PARTY'),
                shipment: !values['hidden'].includes('SHIPMENT'),
                transporter: !values['hidden'].includes('TRANSPORTER'),
                driver: !values['hidden'].includes('DRIVER'),
                mobile: !values['hidden'].includes('MOBILE'),
            },
        };
        this.loadToolsService.dailySetting = setting;

        this.ngxHelperBottomSheetService.close(true);
    }
}
