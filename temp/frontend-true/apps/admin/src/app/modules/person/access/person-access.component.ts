import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserPersonAccessRq, IUserPersonAccessRs, IUserPersonDTO } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { Access, AccessInfo, AccessList, App, AppInfo, AppList, IAccess } from '@lib/shared';

@Component({
    host: { selector: 'person-access' },
    templateUrl: './person-access.component.html',
    styleUrls: ['./person-access.component.scss'],
    standalone: false
})
export class PersonAccessComponent implements OnInit {
    public app: App = this.activatedRoute.snapshot.params['app'];
    public person: IUserPersonDTO = this.activatedRoute.snapshot.data['person'];

    public title: IPageTitle = { title: 'دسترسی کاربر', actions: [{ type: 'RETURN', action: ['/person'] }] };
    public blocks: IPageBlock[] = [];

    public loading: boolean = true;
    public ngxForm: INgxResponsiveForm = { submit: '', sections: [] };

    public actions: Access[] = [];

    public accessList = AccessList;
    public accessInfo = AccessInfo;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        const user: IUserDTO | undefined = this.userService.user;
        if (!user) return;

        // Check app and admin access
        if (!AppList.includes(this.app) || !this.userService.hasAccess({ admin: this.app })) {
            this.router.navigate(['/person']);
            return;
        }

        // Check APP activity
        if (!this.configService.hasApp(this.app)) {
            this.router.navigate(['/person']);
            return;
        }

        // Check user data
        if (!this.person || this.person.admin.includes(this.app)) {
            this.router.navigate(['/person']);
            return;
        }

        const info = AccessInfo;
        this.actions = AccessList.filter((a: Access) => info[a].app === this.app && (info[a].actions || []).length !== 0);

        const form: { type: IAccess['type']; name: string; title: string; access: Access[] }[] = [
            { type: 'DASHBOARD', name: 'dashboard', title: 'داشبورد', access: [] },
            { type: undefined, name: 'access', title: 'دسترسی‌ها', access: [] },
            { type: 'REPORT', name: 'report', title: 'گزارش‌ها', access: [] },
            { type: 'ROLE', name: 'role', title: 'سمت‌ها', access: [] },
        ];
        AccessList.forEach((a) => {
            if (info[a].app !== this.app) return;
            form.find((f) => f.type === info[a].type)?.access.push(a);
        });

        this.ngxForm = {
            submit: `ثبت دسترسی‌های ${AppInfo[this.app].title}`,
            sections: [],
        };

        const columns = form.filter((f) => f.access.length !== 0);
        while (columns.length > 0) {
            const sections = columns.splice(0, 2);
            const inputs: NgxFormInputs[] = [
                {
                    name: sections[0].name,
                    type: 'MULTI-SELECT',
                    title: sections[0].title,
                    value: this.person.access.filter((a) => sections[0].access.includes(a)),
                    options: sections[0].access.map((a) => ({ id: a, title: info[a].title })),
                },
            ];
            if (sections[1])
                inputs.push({
                    name: sections[1].name,
                    type: 'MULTI-SELECT',
                    title: sections[1].title,
                    value: this.person.access.filter((a) => sections[1].access.includes(a)),
                    options: sections[1].access.map((a) => ({ id: a, title: info[a].title })),
                });

            this.ngxForm.sections.push({
                columns: inputs.length === 1 ? inputs : [{ inputs: [inputs[0]] }, { inputs: [inputs[1]] }],
            });
        }

        this.blocks = [
            { title: 'کاربر', value: `${this.person.name.first} ${this.person.name.last}` },
            { title: 'سرویس', value: AppInfo[this.app].title },
        ];

        setTimeout(() => (this.loading = false), 0);
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.person.id;
        const body: IUserPersonAccessRq = {
            app: this.app,
            access: [
                ...(values['dashboard'] || []),
                ...(values['report'] || []),
                ...(values['access'] || []),
                ...(values['role'] || []),
            ],
        };
        this.apiService.request<IUserPersonAccessRs>('UserPersonAccess', { body, ids: { ID } }, (response) => {
            this.person = response;

            const app: string = AppInfo[this.app].title;
            const action: string = body.access.length === 0 ? 'لغو' : 'ثبت';
            this.ngxHelperToastService.success(`دسترسی‌های سرویس ${app} با موفقیت ${action} شد.`);
            this.router.navigate(['/person']);
        });
    }
}
