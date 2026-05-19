import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILogSmsDTO, ILogSmsListRs, IOptionDTO, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'log-sms' },
    templateUrl: './log-sms.component.html',
    styleUrl: './log-sms.component.scss',
    standalone: false
})
export class LogSmsComponent {
    public types: IOptionDTO[] = this.activatedRoute.snapshot.data['types'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'گزارش اس‌ام‌اس',
        toolbar: {
            route: ['/log', 'sms'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'rule',
                    options: [
                        { title: 'ارسال شده', value: 'SENT', icon: 'done' },
                        { title: 'عدم ارسال', value: 'ERROR', icon: 'close', color: 'warn' },
                    ],
                },
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع پیام',
                    options: this.types.map((type) => ({ id: type.title, title: type.title })),
                },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public logs: ILogSmsDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILogSmsDTO> = {
        type: 'گزارش',
        icon: (data) => ({
            icon: data.status === 'SENT' ? 'done' : 'close',
            color: data.status === 'SENT' ? 'primary' : 'warn',
        }),
        description: (data) => data.message,
        columns: [
            { title: 'نوع پیام', value: 'type' },
            { value: 'to', type: 'MOBILE' },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
            {
                title: 'خطا',
                value: (data) => (data.status === 'ERROR' ? this.getError(data.code) : ''),
                color: 'var(--warnColor)',
            },
        ],
    };

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const type: string = this.params?.params?.['type']?.param || '';
        const status: string = this.params?.params?.['status']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILogSmsListRs>('LogSmsList', { params: { type, status, page } }, (response) => {
            this.loading = false;
            this.logs = response.list;
            this.pagination = response.pagination;
        });
    }

    getError(code: string): string {
        if (code === null) return 'سیستم';

        switch (+code) {
            case 0:
                return 'نام کاربری یا رمز عبور اشتباه میباشد.';
            case 2:
                return 'اعتبار کافی نمیباشد.';
            case 3:
                return 'محدودیت در ارسال روزانه.';
            case 4:
                return 'محدودیت در حجم ارسال.';
            case 5:
                return 'شماره فرستنده معتبر نمیباشد.';
            case 6:
                return 'سامانه درحال بروزرسانی میباشد.';
            case 7:
                return 'متن حاوی کلمه فیلتر شده میباشد.';
            case 9:
                return 'ارسال از خطوط عمومی از طریق وب سرویس امکانپذیر نمیباشد.';
            case 10:
                return 'کاربر مورد نظر فعال نمیباشد.';
            case 11:
                return 'ارسال نشده.';
            case 12:
                return 'مدارک کاربر کامل نمیباشد.';
            case 14:
                return ' متن حاوی لینک می باشد.';
            case 15:
                return 'عدم وجود لغو 11 در انتهای متن پیامک.';
        }
        return 'نامشخص';
    }
}
