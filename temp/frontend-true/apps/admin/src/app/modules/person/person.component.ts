import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    IUserPersonDTO,
    IUserPersonListRs,
    IUserPersonStatusRq,
    IUserPersonStatusRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { Access, AccessInfo, App, AppInfo, AppList, UserGroupInfo } from '@lib/shared';

import { PersonCreateComponent } from './create/person-create.component';
import { PersonAdminComponent } from './admin/person-admin.component';
import { PersonPasswordComponent } from './password/person-password.component';
import { PersonInfoComponent } from './info/person-info.component';
import { PersonCodeComponent } from './code/person-code.component';

@Component({
    host: { selector: 'person' },
    templateUrl: './person.component.html',
    styleUrls: ['./person.component.scss'],
    standalone: false
})
export class PersonComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'کاربران',
        toolbar: {
            route: ['/person'],
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
        actions: [{ type: 'CREATE', title: 'کاربر جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public persons: IUserPersonDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IUserPersonDTO> = {
        type: 'کاربر',
        icon: (data) => ({ icon: UserGroupInfo[data.group].icon, color: data.status === 'ACTIVE' ? 'primary' : 'warn' }),
        isDeactive: (data) => data.status === 'BLOCKED',
        columns: [
            { title: 'نام و نام خانوادگی', value: (data) => `${data.name.first} ${data.name.last}` },
            { title: 'نام کاربری', value: 'username', english: true, isDescription: true },
            { title: 'کد پرسنلی', value: 'code', english: true },
            { value: 'mobile', type: 'MOBILE' },
            { title: 'مدیریت', value: (data) => this.getAdmin(data) },
            { title: 'دسترسی', value: (data) => this.getAccess(data) },
        ],
        actions: [
            {
                icon: 'verified_user',
                title: 'لیست دسترسی‌ها',
                action: this.info.bind(this),
                hideOn: (data) => data.id === this.userService.user?.id,
            },
            {
                icon: 'engineering',
                title: 'دسترسی‌ مدیریت',
                action: this.admin.bind(this),
                hideOn: (data) => !this.userService.hasAccess({ group: 'MANAGER' }) || data.group !== 'USER',
            },
            'DIVIDER',
            ...AppList.map((app: App) => ({
                icon: AppInfo[app].icon,
                title: `دسترسی‌های ${AppInfo[app].title}`,
                action: (data: IUserPersonDTO) => ['/person', data.id, 'access', app],
                hideOn: (data: IUserPersonDTO) =>
                    !this.configService.hasApp(app) ||
                    !this.userService.hasAccess({ admin: app }) ||
                    data.admin.includes(app),
            })),
            'DIVIDER',
            {
                icon: 'badge',
                title: 'کد پرسنلی',
                action: this.code.bind(this),
                hideOn: () => !this.userService.hasAccess({ group: 'MANAGER' }),
            },
            {
                icon: 'password',
                title: 'تغییر کلمه عبور',
                action: this.password.bind(this),
                hideOn: () => !this.userService.hasAccess({ group: 'MANAGER' }),
            },
            {
                icon: 'check_box',
                title: 'فعال کردن',
                action: (data: IUserPersonDTO) => this.status(data, true),
                hideOn: (data: IUserPersonDTO) =>
                    !this.userService.hasAccess({ group: 'MANAGER' }) || data.status === 'ACTIVE',
            },
            {
                icon: 'disabled_by_default',
                title: 'مسدود کردن',
                color: 'warn',
                action: (data: IUserPersonDTO) => this.status(data, false),
                hideOn: (data: IUserPersonDTO) =>
                    !this.userService.hasAccess({ group: 'MANAGER' }) || data.status === 'BLOCKED',
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: string = this.params?.params?.['app']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IUserPersonListRs>('UserPersonList', { params: { app, query, page } }, (response) => {
            this.loading = false;
            this.persons = response.list;
            this.pagination = response.pagination;
        });
    }

    getAdmin(person: IUserPersonDTO): string {
        if (person.group !== 'ADMIN') return '';

        const apps: Set<App> = new Set<App>();
        person.admin.forEach((app: App) => apps.add(app));

        return AppList.filter((app: App) => apps.has(app))
            .map((app: App) => AppInfo[app].title)
            .join('، ');
    }

    getAccess(person: IUserPersonDTO): string {
        const apps: Set<App> = new Set<App>();
        person.access.forEach((access: Access) => apps.add(AccessInfo[access].app));

        return AppList.filter((app: App) => apps.has(app))
            .map((app: App) => AppInfo[app].title)
            .join('، ');
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(PersonCreateComponent, 'ثبت کاربر جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('کاربر با موفقیت ثبت شد.');
        });
    }

    admin(person: IUserPersonDTO): void {
        this.ngxHelperBottomSheetService.open(
            PersonAdminComponent,
            'ایجاد دسترسی مدیریت برای کاربر',
            { data: { person } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('دسترسی مدیریت کاربر با موفقیت ثبت شد.');
            },
        );
    }

    info(person: IUserPersonDTO): void {
        this.ngxHelperBottomSheetService.open(
            PersonInfoComponent,
            `لیست دسترسی‌های ${person.name.first} ${person.name.last}`,
            { data: { person } },
        );
    }

    code(person: IUserPersonDTO): void {
        this.ngxHelperBottomSheetService.open(PersonCodeComponent, 'تغییر کد پرسنلی', { data: { person } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('کد پرسنلی کاربر با موفقیت تغییر داده شد.');
        });
    }

    password(person: IUserPersonDTO): void {
        this.ngxHelperBottomSheetService.open(PersonPasswordComponent, 'تغییر کلمه عبور کاربر', { data: { person } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('کلمه عبور کاربر با موفقیت تغییر داده شد.');
        });
    }

    status(person: IUserPersonDTO, active: boolean): void {
        const item: string = 'کاربر';
        const title: string = `${person.name.first} ${person.name.last}`;
        const message: string = active
            ? 'کاربر فعال می‌تواند وارد عضویت خود شود و با توجه به دسترسی‌های در نظر گرفته شده، از امکانات سیستم استفاده کند.'
            : 'کاربر مسدود شده امکان ورود به عضویت و استفاده از امکانات سیستم را ندارد. اطلاعات عضویت کاربر در سیستم باقی می‌ماند و در آینده می‌توانید کاربر را مجددا فعال کنید.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'BLOCK', item, { title, message }, () => {
            const ID: string = person.id;
            const body: IUserPersonStatusRq = { active };
            this.apiService.request<IUserPersonStatusRs>('UserPersonStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`کاربر با موفقیت ${active ? 'فعال' : 'مسدود'} شد.`);
            });
        });
    }
}
