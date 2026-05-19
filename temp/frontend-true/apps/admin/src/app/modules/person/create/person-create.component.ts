import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IUserPersonCreateRq, IUserPersonCreateRs } from '@lib/apis';

@Component({
    host: { selector: 'person-create' },
    templateUrl: './person-create.component.html',
    styleUrls: ['./person-create.component.scss'],
    standalone: false
})
export class PersonCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت کاربر جدید',
        inputs: [
            { name: 'name', type: 'NAME' },
            [
                { name: 'email', type: 'EMAIL', optional: true },
                { name: 'mobile', type: 'MOBILE', optional: true },
            ],
            'مشخصات عضویت',
            [
                { name: 'username', type: 'USERNAME', endWithChar: false },
                { name: 'password', type: 'PASSWORD', minLength: 6 },
            ],
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IUserPersonCreateRq = {
            username: values['username'],
            password: values['password'],
            name: values['name'],
            email: values['email'],
            mobile: values['mobile'],
        };
        this.apiService.request<IUserPersonCreateRs>('UserPersonCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
