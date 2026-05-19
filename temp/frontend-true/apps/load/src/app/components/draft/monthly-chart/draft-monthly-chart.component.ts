import { Component, Input, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperWeightPipe } from '@webilix/ngx-helper/pipe';

import { ChartModule, ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock, IPageCardOption, PageModule } from '@lib/page';

@Component({
    selector: 'draft-monthly-chart',
    imports: [ChartModule, PageModule],
    templateUrl: './draft-monthly-chart.component.html',
    styleUrl: './draft-monthly-chart.component.scss'
})
export class DraftMonthlyChartComponent implements OnInit {
    @Input({ required: true }) first!: Date;
    @Input({ required: true }) last!: Date;
    @Input({ required: true }) data!: { date: Date; count: number; weight: number }[];

    public blocks: IPageBlock[][] = [];

    public option: IPageCardOption = {
        icon: 'calendar_month',
        options: [],
        action: (month: string) => {
            this.selected = month;
            this.chart = this.getChart();
        },
    };

    public description: string = '';
    public chart: EChartsOption = {};

    private weightPipe = new NgxHelperWeightPipe();
    private jalali = JalaliDateTime();
    private daily: { date: string; count: number; weight: number }[] = [];
    private dates: string[] = [];
    private months: { month: string; title: string }[] = [];
    private selected: string = '';

    constructor(private readonly chartService: ChartService) {}

    ngOnInit(): void {
        const format: string = 'W، d N Y H:I';
        this.blocks = [
            [{ title: 'اولین حواله', value: this.jalali.toFullText(this.first, { format }) }],
            [{ title: 'آخرین حواله', value: this.jalali.toFullText(this.last, { format }) }],
        ];

        this.daily = this.data.map((d) => ({
            date: this.jalali.toString(d.date, { format: 'Y-M-D' }),
            count: d.count,
            weight: d.weight,
        }));

        const { months, dates } = this.getDates(this.first, this.last);
        this.dates = dates;
        this.months = months.filter((month) => this.daily.some((d) => d.date.substring(0, 7) === month.month));
        this.selected = months[0].month;

        this.option.options.splice(0, this.option.options.length);
        this.months.forEach((m) => this.option.options.push({ id: m.month, title: m.title }));

        this.chart = this.getChart();
    }

    getDates(from: Date, to: Date): { months: { month: string; title: string }[]; dates: string[] } {
        const getMonth = (date: Date): string => this.jalali.toString(date, { format: 'Y-M' });
        const getString = (date: Date): string => this.jalali.toString(date, { format: 'Y-M-D' });

        if (from.getTime() > to.getTime()) {
            const temp: Date = from;
            from = to;
            to = temp;
        }
        from = this.jalali.periodMonth(1, from).from;
        to = this.jalali.periodDay(1, this.jalali.periodMonth(1, to).to).from;

        const months: Set<string> = new Set<string>().add(getMonth(from));
        const dates: Set<string> = new Set<string>().add(getString(from));
        while (from.getTime() < to.getTime()) {
            from = new Date(from.getTime() + 1 * 3600 * 1000);

            months.add(getMonth(from));
            dates.add(getString(from));
        }

        return {
            months: [...months.values()].reverse().map((month) => {
                const date: Date = new Date(this.jalali.gregorian(`${month}-10`).date);
                return { month, title: this.jalali.toTitle(date, { format: 'N Y' }) };
            }),
            dates: [...dates.values()],
        };
    }

    getChart(): EChartsOption {
        const getDaily = (date: string): { date: string; count: number; weight: number } | undefined =>
            this.daily.find((d) => d.date === date);

        const dates: string[] = this.dates.filter((d) => d.substring(0, 7) === this.selected);

        const date: Date = new Date(this.jalali.gregorian(`${this.selected}-01`).date);
        const month: string = this.jalali.toTitle(date, { format: 'N Y' });
        const count: string = Helper.NUMBER.format(dates.reduce((sum: number, d) => sum + (getDaily(d)?.count || 0), 0));
        const weight: string = Helper.NUMBER.format(dates.reduce((sum: number, d) => sum + (getDaily(d)?.weight || 0), 0));
        this.description = `${month} ‌ / ‌ ${count} حواله ‌ / ‌ ${weight} کیلو`;

        return {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    const date: string = params[0].data?.date;
                    if (!date) return '';

                    const item = this.daily.find((d) => d.date === date);
                    if (!item || item.count === 0 || item.weight === 0) return '';

                    const format: string = 'W، d N Y';
                    const header: string = this.jalali.toTitle(new Date(this.jalali.gregorian(date).date), { format });
                    const data: ChartTooltipData[] = [
                        { title: params[0].seriesName, value: item.count },
                        { title: params[1].seriesName, value: this.weightPipe.transform(item.weight * 1000) },
                    ];

                    return this.chartService.tooltip(header, data);
                },
            },
            xAxis: {
                type: 'category',
                data: dates.map((d) => this.jalali.toTitle(new Date(this.jalali.gregorian(d).date), { format: 'y/M/D' })),
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
                    data: dates.map((date) => ({ value: getDaily(date)?.count || null, date })),
                    name: 'حواله',
                    yAxisIndex: 0,
                    barMaxWidth: 4,
                    color: this.chartService.secondaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: dates.map((date) => ({ value: (getDaily(date)?.weight || 0) * 1000 || null, date })),
                    name: 'وزن',
                    yAxisIndex: 1,
                    barMaxWidth: 13,
                    color: this.chartService.primaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            ],
        };
    }
}
