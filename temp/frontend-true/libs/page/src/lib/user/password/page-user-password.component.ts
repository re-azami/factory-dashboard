import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserPasswordRq, IUserPasswordRs } from '@lib/apis';

@Component({
    host: { selector: 'page-user-password' },
    templateUrl: './page-user-password.component.html',
    styleUrl: './page-user-password.component.scss',
    standalone: false
})
export class PageUserPasswordComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر کلمه عبور',
        inputs: [
            { name: 'current', type: 'PASSWORD', title: 'کلمه عبور فعلی', unverified: true },
            { name: 'password', type: 'PASSWORD', title: 'کلمه عبور جدید', minLength: 6 },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IUserPasswordRq = {
            current: values['current'],
            password: values['password'],
        };
        this.apiService.request<IUserPasswordRs>('UserPassword', { body }, () => {
            this.ngxHelperToastService.success('کلمه عبور جدید با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }
}
