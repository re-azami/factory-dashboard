import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserUpdateRq, IUserUpdateRs } from '@lib/apis';
import { SettingService, UserService } from '@lib/providers';

@Component({
    host: { selector: 'page-user-update' },
    templateUrl: './page-user-update.component.html',
    styleUrl: './page-user-update.component.scss',
    standalone: false
})
export class PageUserUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش مشخصات عضویت',
        inputs: [
            { name: 'name', type: 'NAME', value: this.data.user.name },
            { name: 'email', type: 'EMAIL', value: this.data.user.email, optional: true },
            {
                name: 'mobile',
                type: 'MOBILE',
                value: this.data.user.mobile,
                optional: true,
                description: this.settingService.retrieval
                    ? 'در صورتی که شماره موبایل مشخص نشده باشد و کلمه عبور عضویت خودتان را فراموش کرده باشید، امکان استفاده از سرویس بازیابی کلمه عبور برای شما وجود نخواهد داشت.'
                    : undefined,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { user: IUserDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly settingService: SettingService,
        private readonly userService: UserService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IUserUpdateRq = {
            name: values['name'],
            email: values['email'],
            mobile: values['mobile'],
        };
        this.apiService.request<IUserUpdateRs>('UserUpdate', { body }, (response) => {
            this.userService.initUser(response);
            this.ngxHelperToastService.success('مشخصات عضویت با موفقیت ویرایش شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
