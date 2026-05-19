import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IUserAdminUpdateRq, IUserAdminUpdateRs, IUserPersonDTO } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'admin-update' },
    templateUrl: './admin-update.component.html',
    styleUrls: ['./admin-update.component.scss'],
    standalone: false
})
export class AdminUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش دسترسی مدیریت',
        inputs: [
            { type: 'COMMENT', title: 'کابر', value: `${this.data.admin.name.first} ${this.data.admin.name.last}` },
            {
                name: 'apps',
                type: 'MULTI-SELECT',
                title: 'سرویس‌ها',
                value: this.data.admin.admin,
                options: AppList.filter((a: App) => this.configService.hasApp(a)).map((a: App) => ({
                    id: a,
                    title: AppInfo[a].title,
                })),
                minCount: 1,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { admin: IUserPersonDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.admin.id;
        const body: IUserAdminUpdateRq = { apps: values['apps'] };
        this.apiService.request<IUserAdminUpdateRs>('UserAdminUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
