import { Component, Input, OnInit } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, ILogVersionAppRs, ILogVersionAppUserDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock } from '@lib/page';
import { App } from '@lib/shared';

@Component({
    selector: 'log-version-app',
    templateUrl: './log-version-app.component.html',
    styleUrl: './log-version-app.component.scss',
    standalone: false
})
export class LogVersionAppComponent implements OnInit {
    @Input({ required: true }) app!: 'ADMIN' | App;

    public loading: boolean = true;
    public log!: ILogVersionAppRs;
    public blocks: IPageBlock[] = [];

    public list: IList<ILogVersionAppUserDTO> = {
        type: 'نسخه',
        columns: [
            { title: 'کاربر', value: (data) => data.user.name },
            {
                title: 'نسخه مورد استفاده',
                value: 'version',
                english: true,
                color: (data) => (data.version !== this.log.version.version ? 'var(--warnColor)' : ''),
            },
            { title: 'تعداد استفاده', value: 'count', type: 'NUMBER' },
            { title: 'آخرین استفاده', value: 'lastUse', type: 'DATE' },
        ],
    };

    private jalali = JalaliDateTime();

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.request<ILogVersionAppRs>(
            'LogVersionApp',
            { params: { app: this.app }, loading: false },
            (response) => {
                this.loading = false;
                this.log = response;
                if (!this.log.version) return;

                this.blocks = [
                    { title: 'آخرین نسخه', value: this.log.version.version, english: true },
                    { title: 'تاریخ انتشار', value: this.jalali.toTitle(this.log.version.date) },
                    { title: 'نسخه انتشار', value: this.log.version.build, english: true },
                ];
            },
        );
    }
}
