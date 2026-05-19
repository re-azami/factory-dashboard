import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IUserPersonDTO, IUserPersonPasswordRq, IUserPersonPasswordRs } from '@lib/apis';

@Component({
    host: { selector: 'person-password' },
    templateUrl: './person-password.component.html',
    styleUrls: ['./person-password.component.scss'],
    standalone: false
})
export class PersonPasswordComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر کلمه عبور کاربر',
        inputs: [
            { type: 'COMMENT', title: 'کابر', value: `${this.data.person.name.first} ${this.data.person.name.last}` },
            { name: 'password', type: 'PASSWORD', minLength: 6 },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { person: IUserPersonDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.person.id;
        const body: IUserPersonPasswordRq = { password: values['password'] };
        this.apiService.request<IUserPersonPasswordRs>('UserPersonPassword', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
