import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IUserPersonCodeRq, IUserPersonCodeRs, IUserPersonDTO } from '@lib/apis';

@Component({
    host: { selector: 'person-code' },
    templateUrl: './person-code.component.html',
    styleUrl: './person-code.component.scss',
    standalone: false
})
export class PersonCodeComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر کد پرسنلی کاربر',
        inputs: [
            { type: 'COMMENT', title: 'کابر', value: `${this.data.person.name.first} ${this.data.person.name.last}` },
            {
                name: 'code',
                type: 'NUMERIC',
                minLength: 4,
                maxLength: 4,
                title: 'کد پرسنلی',
                value: this.data.person.code,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { person: IUserPersonDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.person.id;
        const body: IUserPersonCodeRq = { code: values['code'] };
        this.apiService.request<IUserPersonCodeRs>('UserPersonCode', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
