import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

import {
    ApiService,
    IEducationDashboardCountRs,
    IEducationDashboardStudyRs,
    IEducationStudyDTO,
    IEducationStudyListRs,
} from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock } from '@lib/page';
import { UserService } from '@lib/providers';
import { EducationEducatorInfo } from '@lib/shared';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit {
    public educationEducatorInfo = EducationEducatorInfo;

    public count: { loading: boolean; blocks: IPageBlock[][]; study: number; participant: number; hour: number } = {
        loading: true,
        blocks: [],
        study: 0,
        participant: 0,
        hour: 0,
    };

    public studies: { loading: boolean; data: { icon: string; title: string; chart: EChartsOption }[] } = {
        loading: true,
        data: [],
    };

    public active: { start: Date | null; period: { from: Date; to: Date }; study: IEducationStudyDTO }[] = [];
    public activeLoading: boolean = true;
    public activeAccess: boolean = this.userService.hasAccess({ access: ['EDUCATION_ACTIVE', 'EDUCATION_ROLE_STUDY'] });

    constructor(
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IEducationDashboardCountRs>('EducationDashboardCount', (response) => {
            this.count.loading = false;
            this.count.blocks = [
                [{ title: 'دوره', value: response.study }],
                [
                    { title: 'شرکت‌کننده', value: response.participant },
                    { title: 'نفر/ ساعت', value: response.hour },
                ],
            ];
        });

        if (this.userService.hasAccess({ access: 'EDUCATION_DASHBOARD_STUDY' })) this.loadStudy();
        if (this.userService.hasAccess({ access: ['EDUCATION_DASHBOARD_ACTIVE'] })) this.loadActive();
    }

    getChart(title: string, data: { title: string; value: number }[]): EChartsOption {
        const total: number = data.reduce((sum: number, d) => sum + d.value, 0);

        return {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    if (params[0].value === 0) return '';

                    const header: string = params[0].name;
                    const data: ChartTooltipData[] = [
                        { title: params[0].seriesName, value: params[0].value, percent: (params[0].value * 100) / total },
                    ];

                    return this.chartService.tooltip(header, data);
                },
            },
            xAxis: {
                type: 'category',
                data: data.map((d) => d.title),
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
                    data: data.map((d) => d.value),
                    name: title,
                    barMaxWidth: 13,
                    color: this.chartService.primaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            ],
        };
    }

    loadStudy(): void {
        this.apiService.request<IEducationDashboardStudyRs>('EducationDashboardStudy', (response) => {
            this.studies.loading = false;
            this.studies.data = [
                {
                    icon: 'task_alt',
                    title: 'دوره‌های برگزار شده',
                    chart: this.getChart(
                        'دوره',
                        response.map((r) => ({ title: r.title, value: r.study })),
                    ),
                },
                {
                    icon: 'groups_2',
                    title: 'شرکت‌کننده‌های دوره‌ها',
                    chart: this.getChart(
                        'شرکت‌کننده',
                        response.map((r) => ({ title: r.title, value: r.participant })),
                    ),
                },
                {
                    icon: 'history_toggle_off',
                    title: 'نفر/ساعت برگزاری دوره',
                    chart: this.getChart(
                        'نفر/ساعت',
                        response.map((r) => ({ title: r.title, value: Math.trunc(r.hour / 3600) })),
                    ),
                },
            ];
        });
    }

    loadActive(): void {
        const jalali = JalaliDateTime();
        const now: number = new Date().getTime();
        const getStart = (date: Date): Date | null => {
            date = jalali.periodDay(1, date).from;
            return date.getTime() <= now ? null : date;
        };

        this.apiService.request<IEducationStudyListRs>('EducationStudyList', (response) => {
            this.activeLoading = false;
            this.active = response.map((study: IEducationStudyDTO) => ({
                start: getStart(study.dates[0].date),
                period: { from: study.dates[0].date, to: study.dates[study.dates.length - 1].date },
                study,
            }));
        });
    }
}
