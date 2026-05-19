import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IUserRetrievalConfirmRq,
    IUserRetrievalConfirmRs,
    IUserRetrievalRequestRq,
    IUserRetrievalRequestRs,
    IUserRetrievalResendRq,
    IUserRetrievalResendRs,
} from '@lib/apis';
import { SettingService } from '@lib/providers';

@Component({
    host: { selector: 'page-user-retrieval' },
    templateUrl: './page-user-retrieval.component.html',
    styleUrl: './page-user-retrieval.component.scss',
    standalone: false
})
export class PageUserRetrievalComponent implements OnInit, OnDestroy {
    public retrieval: boolean = this.settingService.retrieval;
    public action: 'REQUEST' | 'CONFIRM' = 'REQUEST';

    public id: string = '';
    public username: string = '';
    public mobile: string = '';

    public ngxFormRequest: INgxForm = {
        submit: 'بازیابی کلمه عبور',
        inputs: [
            { name: 'username', type: 'USERNAME', unverified: true },
            { name: 'mobile', type: 'MOBILE' },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/']) }],
    };

    public ngxFormConfirm: INgxForm = {
        submit: 'بازیابی کلمه عبور',
        inputs: [
            { type: 'COMMENT', title: 'نام کاربری', value: '', english: true },
            { name: 'code', type: 'NUMERIC', title: 'کد تایید', minLength: 6, maxLength: 6 },
            { name: 'password', type: 'PASSWORD', title: 'کلمه عبور جدید', minLength: 6 },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/']) }],
    };

    public period: number = 60;
    public timeout: number = 0;
    public canResend: boolean = false;
    public interval?: any;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly settingService: SettingService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        if (!this.retrieval) {
            this.router.navigate(['/']);
            return;
        }

        this.interval = setInterval(() => {
            if (!this.canResend || this.timeout <= 0) return;

            this.timeout--;
        }, 1000);
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

    ngxSubmitRequest(values: INgxFormValues): void {
        const body: IUserRetrievalRequestRq = {
            username: values['username'],
            mobile: values['mobile'],
        };
        this.apiService.request<IUserRetrievalRequestRs>('UserRetrievalRequest', { body }, (response) => {
            (this.ngxFormConfirm.inputs[0] as any).value = response.username;

            this.id = response.id;
            this.username = response.username;
            this.mobile = response.mobile;
            this.action = 'CONFIRM';

            this.timeout = this.period;
            this.canResend = true;
        });
    }

    ngxSubmitConfirm(values: INgxFormValues): void {
        const body: IUserRetrievalConfirmRq = {
            id: this.id,
            code: values['code'],
            username: this.username,
            mobile: this.mobile,
            password: values['password'],
        };
        this.apiService.request<IUserRetrievalConfirmRs>('UserRetrievalConfirm', { body }, () => {
            this.ngxHelperToastService.success('کلمه عبور با موفقیت تغییر داده شد.');
            this.router.navigate(['/']);
        });
    }

    resend(): void {
        if (!this.canResend || this.timeout > 0) return;

        const body: IUserRetrievalResendRq = {
            id: this.id,
            username: this.username,
            mobile: this.mobile,
        };
        this.apiService.request<IUserRetrievalResendRs>('UserRetrievalResend', { body }, (response) => {
            this.timeout = this.period;
            this.canResend = response.canResend;
            this.ngxHelperToastService.success('کد تایید درخواست مجددا ارسال شد.');
        });
    }
}
