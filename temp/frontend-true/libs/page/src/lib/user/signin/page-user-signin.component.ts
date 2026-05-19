import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';

import { ApiService, IUserSigninRq, IUserSigninRs } from '@lib/apis';
import { SettingService, UserService } from '@lib/providers';

@Component({
    host: { selector: 'page-user-signin' },
    templateUrl: './page-user-signin.component.html',
    styleUrl: './page-user-signin.component.scss',
    standalone: false
})
export class PageUserSigninComponent {
    public retrieval: boolean = this.settingService.retrieval;

    public ngxForm: INgxForm = {
        submit: 'ورود',
        inputs: [
            { name: 'username', type: 'USERNAME', unverified: true },
            { name: 'password', type: 'PASSWORD', unverified: true },
        ],
    };

    constructor(
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly settingService: SettingService,
        private readonly userService: UserService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: IUserSigninRq = {
            username: values['username'],
            password: values['password'],
        };
        this.apiService.request<IUserSigninRs>('UserSignin', { body }, (response) => {
            this.userService.signin(response.token, response.user);
            this.router.navigate(['/dashboard']);
        });
    }
}
