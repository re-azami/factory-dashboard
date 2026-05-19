import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportDraftRs } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    host: { selector: 'report-draft' },
    templateUrl: './report-draft.component.html',
    styleUrl: './report-draft.component.scss',
    standalone: false
})
export class ReportDraftComponent {
    public loadCargoList = LoadCargoList;
    public loadCargoInfo = LoadCargoInfo;

    public type: 'DRAFT' | 'DAILY' = this.activatedRoute.snapshot.data['type'];
    public title: IPageTitle = {
        title: this.type === 'DAILY' ? 'گزارش روزانه' : 'گزارش حواله‌',
        toolbar: {
            route: ['/report', this.type === 'DAILY' ? 'daily' : 'draft'],
            calendar: { types: this.type === 'DAILY' ? ['DAY'] : ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
        },
    };

    public loading: boolean = true;
    public report!: ILoadReportDraftRs;
    public types!: { [key in LoadCargo]: { count: number; weight: number } };
    public data: { title: string; icon: string; count: number; weight: number }[] = [];

    public totalBlock: IPageBlock[] = [];

    public formLoading: boolean = true;
    public from!: Date;
    public to!: Date;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadReport();
    }

    loadReport(): void {
        this.formLoading = true;

        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILoadReportDraftRs>('LoadReportDraft', { params: { from, to } }, (response) => {
            this.loading = false;
            this.formLoading = false;
            this.report = response;

            this.types = {
                OUT: { count: 0, weight: 0 },
                IN: { count: 0, weight: 0 },
                BUY: { count: 0, weight: 0 },
                SITE: { count: 0, weight: 0 },
            };
            response.cargos.forEach((c) => {
                this.types[c.type].count += c.count;
                this.types[c.type].weight += c.weight;
            });

            this.totalBlock = [
                { title: 'تعداد کل حواله‌ها', value: response.count },
                { title: 'وزن حواله‌ها', value: response.weight },
            ];

            this.data = [
                {
                    title: 'بار ورودی',
                    icon: LoadCargoInfo['IN'].icon,
                    count: this.types['IN'].count + this.types['BUY'].count,
                    weight: this.types['IN'].weight + this.types['BUY'].weight,
                },
                {
                    title: 'بار خروجی',
                    icon: LoadCargoInfo['OUT'].icon,
                    count: this.types['OUT'].count,
                    weight: this.types['OUT'].weight,
                },
                {
                    title: 'بار داخلی',
                    icon: LoadCargoInfo['SITE'].icon,
                    count: this.types['SITE'].count,
                    weight: this.types['SITE'].weight,
                },
            ];
        });
    }
}
