import { Component } from '@angular/core';
import { EChartsOption, SeriesOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILogMonthlyRs } from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock, IPageTitle } from '@lib/page';
import { App, AppInfo, AppList } from '@lib/shared';

@Component({
    host: { selector: 'log-monthly' },
    templateUrl: './log-monthly.component.html',
    styleUrls: ['./log-monthly.component.scss'],
    standalone: false
})
export class LogMonthlyComponent {
    public title: IPageTitle = {
        title: 'گزارش ماهانه',
        toolbar: { route: ['/log', 'monthly'], calendar: { types: ['MONTH'], maxDate: new Date() } },
    };

    public loading: boolean = true;
    public blocks: IPageBlock[][] = [];
    public request: number = 0;
    public chart: EChartsOption = {};

    constructor(private readonly apiService: ApiService, private readonly chartService: ChartService) {}

    loadReport(values: INgxHelperCalendarValue): void {
        const date: string = values.period.from.toJSON();
        this.apiService.request<ILogMonthlyRs>('LogMonthly', { params: { date } }, (response) => {
            this.loading = false;
            const res: number = response.reduce((sum: number, r) => sum + r.apps.reduce((s, a) => s + a.response, 0), 0);
            const exp: number = response.reduce((sum: number, r) => sum + r.apps.reduce((s, a) => s + a.exception, 0), 0);
            this.request = res + exp;
            if (this.request === 0) return;

            this.blocks = [
                [{ title: 'درخواست', value: this.request }],
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
                        const indexes: number[] = [...Array(params.length).keys()];
                        const response: number = indexes.reduce(
                            (sum: number, i) => sum + (i % 2 === 0 ? params[i].value : 0),
                            0,
                        );
                        const exception: number = indexes.reduce(
                            (sum: number, i) => sum + (i % 2 === 1 ? params[i].value : 0),
                            0,
                        );
                        const total: number = response + exception;
                        if (total === 0) return '';

                        const header: string = params[0].name;
                        const data: ChartTooltipData[] = [
                            ...indexes
                                .filter((index: number) => index % 2 === 0 && params[index].value !== 0)
                                .map((index: number) => ({
                                    color: params[index].color,
                                    title: `پاسخ ${params[index].seriesName}`,
                                    value: params[index].value,
                                    percent: (params[index].value / response) * 100,
                                })),
                            'DIVIDER',
                            ...indexes
                                .filter((index: number) => index % 2 === 1 && params[index].value !== 0)
                                .map((index: number) => ({
                                    color: params[index].color,
                                    title: `اشکال ${params[index].seriesName}`,
                                    value: params[index].value,
                                    percent: (params[index].value / exception) * 100,
                                })),
                            'DIVIDER',
                            {
                                title: 'کل درخواست‌ها',
                                value: total,
                                percent: (total / this.request) * 100,
                            },
                        ];

                        return this.chartService.tooltip(header, data);
                    },
                },
                xAxis: {
                    type: 'category',
                    data: response.map((r) => r.title),
                    axisLabel: { fontFamily: 'Yekan', fontSize: 11 },
                    position: 'bottom',
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: { fontFamily: 'Yekan', formatter: (value: number) => Helper.NUMBER.format(value) },
                    axisLine: { show: true },
                },
                series: [null, ...AppList]
                    .map((app: App | null, index: number) => [
                        {
                            type: 'bar',
                            data: response.map((r) => r.apps.find((a) => a.app === app)?.response || 0),
                            name: app === null ? 'عمومی' : AppInfo[app].title,
                            barMaxWidth: 13,
                            color: this.chartService.primaryColor,
                            showBackground: true,
                            backgroundStyle: { color: this.chartService.backgroundColor },
                            stack: 'day',
                        },
                        ,
                        {
                            type: 'bar',
                            data: response.map((r) => r.apps.find((a) => a.app === app)?.exception || 0),
                            name: app === null ? 'عمومی' : AppInfo[app].title,
                            barMaxWidth: 13,
                            color: this.chartService.warnColor,
                            showBackground: true,
                            backgroundStyle: { color: this.chartService.backgroundColor },
                            stack: 'day',
                        },
                    ])
                    .flat() as SeriesOption[],
            };
        });
    }
}
