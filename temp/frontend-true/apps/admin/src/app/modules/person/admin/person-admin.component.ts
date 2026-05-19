import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IUserAdminCreateRq, IUserAdminCreateRs, IUserPersonDTO } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'person-admin' },
    templateUrl: './person-admin.component.html',
    styleUrls: ['./person-admin.component.scss'],
    standalone: false
})
export class PersonAdminComponent {
    public ngxForm: INgxForm = {
        submit: 'ایجاد دسترسی مدیریت برای کاربر',
        inputs: [
            { type: 'COMMENT', title: 'کابر', value: `${this.data.person.name.first} ${this.data.person.name.last}` },
            {
                name: 'apps',
                type: 'MULTI-SELECT',
                title: 'سرویس‌ها',
                options: AppList.filter((a: App) => this.configService.hasApp(a)).map((a: App) => ({
                    id: a,
                    title: AppInfo[a].title,
                })),
                minCount: 1,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { person: IUserPersonDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IUserAdminCreateRq = {
            id: this.data.person.id,
            apps: values['apps'],
        };
        this.apiService.request<IUserAdminCreateRs>('UserAdminCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
