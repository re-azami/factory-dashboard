import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperWeightPipe } from '@webilix/ngx-helper/pipe';

import { ApiService, ILoadReportCargoChartRs, ILoadReportCargoInfoRs, ILoadReportCargoMonthRs } from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock, IPageCardOption } from '@lib/page';

@Component({
    host: { selector: 'report-cargo-chart' },
    templateUrl: './report-cargo-chart.component.html',
    styleUrl: './report-cargo-chart.component.scss',
    standalone: false
})
export class ReportCargoChartComponent implements OnInit {
    public info: ILoadReportCargoInfoRs = this.activatedRoute.snapshot.data['info'];
    public months: ILoadReportCargoMonthRs = this.activatedRoute.snapshot.data['months'];

    public index: number = 0;
    public blocks: IPageBlock[] = [];
    public option: IPageCardOption = {
        icon: 'calendar_month',
        action: (id: string) => this.setIndex(+id),
        options: [],
    };

    public loading: boolean = false;
    public chart: EChartsOption = {};

    private weightPipe = new NgxHelperWeightPipe();
    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
    ) {}

    ngOnInit(): void {
        this.months.forEach((month, index: number) =>
            this.option.options.push({ id: index.toString(), title: month.title }),
        );

        this.setIndex(0);
    }

    setIndex(index: number): void {
        if (!this.months[index]) return;

        this.index = index;
        this.blocks = [
            { title: 'ماه', value: this.months[this.index].title },
            { title: 'حواله', value: this.months[this.index].count },
            { title: 'وزن', value: this.months[this.index].weight },
        ];

        const ID: string = this.info.cargo.id;
        const from: string = this.months[this.index].from.toJSON();
        const to: string = this.months[this.index].to.toJSON();
        this.apiService.request<ILoadReportCargoChartRs>(
            'LoadReportCargoChart',
            { ids: { ID }, params: { from, to } },
            (response) => {
                this.loading = false;

                const getData = (date: Date): { count: number; weight: number } => {
                    const day: string = this.jalali.toString(date, { format: 'Y-M-D' });
                    const data = response.find((r) => r.day === day);
                    return { count: data?.count || 0, weight: data?.weight || 0 };
                };

                const dates: Date[] = [];
                const days: number = this.jalali.daysInMonth(this.months[this.index].month);
                for (let d = 0; d < days; d++)
                    dates.push(new Date(this.months[this.index].from.getTime() + d * 24 * 3600 * 1000));

                this.chart = {
                    grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
                    silent: true,

                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        position: this.chartService.tooltipPosition(),
                        formatter: (params: any): string => {
                            const date: Date = params[0].data?.date;
                            if (!date) return '';

                            const item = getData(date);
                            if (!item || item.count === 0 || item.weight === 0) return '';

                            const format: string = 'W، d N Y';
                            const header: string = this.jalali.toTitle(date, { format });
                            const data: ChartTooltipData[] = [
                                { title: params[0].seriesName, value: item.count },
                                { title: params[1].seriesName, value: this.weightPipe.transform(item.weight * 1000) },
                            ];

                            return this.chartService.tooltip(header, data);
                        },
                    },

                    xAxis: {
                        type: 'category',
                        data: dates.map((d) => this.jalali.toTitle(d, { format: 'y/M/D' })),
                        axisLabel: { fontFamily: 'Yekan', fontSize: 11, rotate: 45 },
                        position: 'bottom',
                    },
                    yAxis: [
                        {
                            type: 'value',
                            minInterval: 1,
                            axisLabel: { fontFamily: 'Yekan', formatter: (value: number) => Helper.NUMBER.format(value) },
                            axisLine: { show: true },
                        },
                        {
                            type: 'value',
                            minInterval: 1_000_000,
                            axisLabel: {
                                width: 40,
                                fontFamily: 'Yekan',
                                color: this.chartService.primaryColor,
                                formatter: (value: number) => this.weightPipe.transform(value, { short: false }),
                            },
                            axisLine: { show: true },
                        },
                    ],
                    series: [
                        {
                            type: 'bar',
                            data: dates.map((date) => ({ value: getData(date)?.count || null, date })),
                            name: 'حواله',
                            yAxisIndex: 0,
                            barMaxWidth: 4,
                            color: this.chartService.secondaryColor,
                            showBackground: true,
                            backgroundStyle: { color: this.chartService.backgroundColor },
                        },
                        {
                            type: 'bar',
                            data: dates.map((date) => ({ value: (getData(date)?.weight || 0) * 1000 || null, date })),
                            name: 'وزن',
                            yAxisIndex: 1,
                            barMaxWidth: 13,
                            color: this.chartService.primaryColor,
                            showBackground: true,
                            backgroundStyle: { color: this.chartService.backgroundColor },
                        },
                    ],
                };
            },
        );
    }
}
