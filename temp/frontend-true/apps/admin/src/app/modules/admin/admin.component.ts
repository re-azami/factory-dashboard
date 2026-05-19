import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, IPaginationDTO, IUserAdminDeleteRs, IUserAdminListRs, IUserPersonDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { App, AppInfo, AppList, UserGroupInfo } from '@lib/shared';

import { AdminUpdateComponent } from './update/admin-update.component';
import { ConfigService } from '@lib/providers';

@Component({
    host: { selector: 'admin' },
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: false,
})
export class AdminComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیران',
        toolbar: {
            route: ['/admin'],
            params: [
                {
                    name: 'app',
                    type: 'SELECT',
                    title: 'سرویس',
                    options: AppList.filter((app: App) => app !== 'SUPPORT')
                        .filter((app: App) => this.configService.hasApp(app))
                        .map((app: App) => ({ id: app, title: AppInfo[app].title })),
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public admins: IUserPersonDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IUserPersonDTO> = {
        type: 'مدیر',
        icon: (data) => ({ icon: UserGroupInfo[data.group].icon, color: data.status === 'ACTIVE' ? 'primary' : 'warn' }),
        isDeactive: (data) => data.status === 'BLOCKED',
        columns: [
            { title: 'نام و نام خانوادگی', value: (data) => `${data.name.first} ${data.name.last}` },
            { title: 'نام کاربری', value: 'username', english: true, isDescription: true },
            { title: 'کد پرسنلی', value: 'code', english: true },
            { value: 'mobile', type: 'MOBILE' },
            { title: 'سرویس‌ها', value: (data) => this.getAdmin(data) },
        ],
        actions: [
            { icon: 'edit', title: 'ویرایش دسترسی‌‌ها', action: this.update.bind(this) },
            { icon: 'delete', title: 'حذف دسترسی', action: this.delete.bind(this), color: 'warn' },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IUserAdminListRs>('UserAdminList', { params: { app, query, page } }, (response) => {
            this.loading = false;
            this.admins = response.list;
            this.pagination = response.pagination;
        });
    }

    getAdmin(person: IUserPersonDTO): string {
        const apps: Set<App> = new Set<App>();
        if (person.group === 'ADMIN') person.admin.forEach((app: App) => apps.add(app));

        return AppList.filter((app: App) => apps.has(app))
            .map((app: App) => AppInfo[app].title)
            .join('، ');
    }

    update(admin: IUserPersonDTO): void {
        this.ngxHelperBottomSheetService.open(AdminUpdateComponent, 'ویرایش دسترسی مدیریت', { data: { admin } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('دسترسی مدیریت کاربر با موفقیت ویرایش شد.');
        });
    }

    delete(admin: IUserPersonDTO): void {
        const item: string = 'دسترسی مدیریت';
        const title: string = `${admin.name.first} ${admin.name.last}`;
        const message: string =
            'در صورت تایید، مدیر امکان استفاده از امکانات بخش مدیریت سایت را نخواهد داشت اما می‌تواند با ورود به عضویت خود در سایر سرویس‌ها، از امکانات آنها استفاده کند.';
        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = admin.id;
            this.apiService.request<IUserAdminDeleteRs>('UserAdminDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('دسترسی مدیریت کاربر با موفقیت حذف شد.');
            });
        });
    }
}
