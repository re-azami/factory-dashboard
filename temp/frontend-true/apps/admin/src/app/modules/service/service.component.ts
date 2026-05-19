import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILogAppRs } from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock, IPageTitle } from '@lib/page';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'service' },
    templateUrl: './service.component.html',
    styleUrl: './service.component.scss',
    standalone: false
})
export class ServiceComponent implements OnInit {
    public app!: App;
    public title!: IPageTitle;

    public loading: boolean = true;
    public blocks: IPageBlock[][] = [];
    public user: number = 0;
    public chart: EChartsOption = {};

    private from?: Date;
    private to?: Date;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe({
            next: (params: ParamMap) => {
                const app: App = params.get('APP') as App;
                if (!app || !AppList.includes(app)) {
                    this.router.navigate(['/dashboard']);
                    return;
                }

                this.app = app;
                this.loading = true;

                this.title = {
                    title: `گزارش سرویس ${AppInfo[this.app].title}`,
                    toolbar: {
                        route: ['/service', this.app],
                        calendar: { types: ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
                    },
                };
                this.loadReport();
            },
        });
    }

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadReport();
    }

    loadReport(): void {
        if (!this.app || !this.from || !this.to) return;

        const app: string = this.app;
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILogAppRs>('LogApp', { params: { app, from, to } }, (response) => {
            this.loading = false;
            this.user = response.length;
            if (this.user === 0) return;

            const res: number = response.reduce((sum: number, r) => sum + r.response, 0);
            const exp: number = response.reduce((sum: number, r) => sum + r.exception, 0);
            const request = res + exp;
            this.blocks = [
                [
                    { title: 'درخواست', value: request },
                    { title: 'کاربر', value: this.user },
                ],
                [
                    { title: 'پاسخ', value: res },
                    { title: 'اشکال', value: exp, color: 'warn' },
                ],
            ];

            this.chart = {
                grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
                silent: true,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    position: this.chartService.tooltipPosition(),
                    formatter: (params: any): string => {
                        const header: string = params[0].name;
                        const total: number = params[0].value + params[1].value;
                        const data: ChartTooltipData[] = [
                            {
                                color: params[0].color,
                                title: params[0].seriesName,
                                value: params[0].value,
                                percent: (params[0].value / total) * 100,
                            },
                            {
                                color: params[1].color,
                                title: params[1].seriesName,
                                value: params[1].value,
                                percent: (params[1].value / total) * 100,
                            },
                            'DIVIDER',
                            {
                                title: 'کل درخواست‌ها',
                                value: total,
                                percent: (total / request) * 100,
                            },
                        ];

                        return this.chartService.tooltip(header, data);
                    },
                },
                xAxis: {
                    type: 'category',
                    data: response.map((r) => r.name),
                    axisLabel: { fontFamily: 'Yekan', fontSize: 11 },
                    position: 'bottom',
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: { fontFamily: 'Yekan', formatter: (value: number) => Helper.NUMBER.format(value) },
                    axisLine: { show: true },
                },
                series: [
                    {
                        type: 'bar',
                        data: response.map((r) => r.response),
                        name: 'پاسخ',
                        barMaxWidth: 13,
                        color: this.chartService.primaryColor,
                        showBackground: true,
                        backgroundStyle: { color: this.chartService.backgroundColor },
                        stack: 'user',
                    },
                    {
                        type: 'bar',
                        data: response.map((r) => r.exception),
                        name: 'اشکال',
                        barMaxWidth: 13,
                        color: this.chartService.warnColor,
                        showBackground: true,
                        backgroundStyle: { color: this.chartService.backgroundColor },
                        stack: 'user',
                    },
                ],
            };
        });
    }
}
