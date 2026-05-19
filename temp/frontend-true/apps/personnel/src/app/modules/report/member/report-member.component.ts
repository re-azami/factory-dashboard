import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';

import { ApiService, IPersonnelReportMemberRs } from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageTitle } from '@lib/page';
import {
    PersonnelGender,
    PersonnelGenderInfo,
    PersonnelGenderList,
    PersonnelStatus,
    PersonnelStatusInfo,
    PersonnelStatusList,
} from '@lib/shared';

interface IData {
    title: string;
    chart: EChartsOption;
}

@Component({
    host: { selector: 'report-member' },
    templateUrl: './report-member.component.html',
    styleUrl: './report-member.component.scss',
    standalone: false
})
export class ReportMemberComponent implements OnInit {
    public personnelStatusList = PersonnelStatusList;
    public personnelStatusInfo = PersonnelStatusInfo;
    public personnelGenderList = PersonnelGenderList;
    public personnelGenderInfo = PersonnelGenderInfo;

    public title: IPageTitle = { title: 'گزارش پرسنل' };

    public loading: boolean = true;
    public total: number = 0;
    public count: number = 0;
    public statusChart: EChartsOption = {};
    public genderChart: EChartsOption = {};
    public data: IData[] = [];

    private status: { type: PersonnelStatus; count: number }[] = [];
    private genders: { gender: PersonnelGender; count: number }[] = [];

    constructor(private readonly apiService: ApiService, private readonly chartService: ChartService) {}

    ngOnInit(): void {
        this.apiService.request<IPersonnelReportMemberRs>('PersonnelReportMember', (response) => {
            this.loading = false;

            this.total = response.total;
            if (this.total === 0) return;

            this.status = response.status;
            this.statusChart = {
                grid: { containLabel: true, left: 0, right: 0, top: 0, bottom: 0 },
                silent: true,
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '75%'],
                        avoidLabelOverlap: false,
                        label: { show: false },
                        emphasis: { label: { show: false } },
                        labelLine: { show: false },
                        data: PersonnelStatusList.map((status) => ({
                            value: this.getStatusCount(status),
                            itemStyle: { color: PersonnelStatusInfo[status].chart, borderWidth: 1, borderColor: '#FFF' },
                        })),
                    },
                ],
            };

            this.count = response.count;
            if (this.count === 0) return;

            this.genders = response.genders;
            this.genderChart = {
                grid: { containLabel: true, left: 0, right: 0, top: 0, bottom: 0 },
                silent: true,
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '75%'],
                        avoidLabelOverlap: false,
                        label: { show: false },
                        emphasis: { label: { show: false } },
                        labelLine: { show: false },
                        data: PersonnelGenderList.map((gender) => ({
                            value: this.getGenderCount(gender),
                            itemStyle: { color: PersonnelGenderInfo[gender].color, borderWidth: 1, borderColor: '#FFF' },
                        })),
                    },
                ],
            };

            const departments = response.departments.map((d) => ({ ...d, percent: 0 }));
            const positions = response.positions.map((p) => ({ ...p, percent: 0 }));
            const educations = response.educations.map((e) => ({ ...e, percent: 0 }));
            this.data = [
                { title: 'واحد', chart: this.getChart([...departments].reverse()) },
                { title: 'سمت', chart: this.getChart([...positions].reverse()) },
                { title: 'مدرک تحصیلی', chart: this.getChart([...educations].reverse()) },
            ];
        });
    }

    getStatusCount(type: PersonnelStatus): number {
        return this.status.find((s) => s.type === type)?.count || 0;
    }

    getStatusPercent(type: PersonnelStatus): number {
        if (this.total <= 0) return 0;

        const value: number = this.getStatusCount(type);
        return +((value * 100) / this.total).toFixed(2);
    }

    getGenderCount(gender: PersonnelGender): number {
        return this.genders.find((g) => g.gender === gender)?.count || 0;
    }

    getGenderPercent(gender: PersonnelGender): number {
        if (this.count <= 0) return 0;

        const value: number = this.getGenderCount(gender);
        return +((value * 100) / this.count).toFixed(2);
    }

    getChart(data: { id: string; title: string; count: number; percent: number }[]): EChartsOption {
        const total: number = data.reduce((sum: number, d) => sum + d.count, 0);
        data.forEach((d) => (d.percent = +((d.count * 100) / total).toFixed(2)));

        return {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    const header: string = params[0].name;
                    const data: ChartTooltipData[] = [
                        { title: params[0].seriesName, value: params[0].value },
                        { title: 'درصد', value: params[0].data.percent },
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
                axisLabel: {
                    fontFamily: 'Yekan',
                    formatter: (value: number) => Helper.NUMBER.format(value),
                },
                axisLine: { show: true },
            },
            series: [
                {
                    type: 'bar',
                    data: data.map((d) => ({ value: d.count, percent: d.percent })),
                    name: 'تعداد پرسنل',
                    barMaxWidth: 13,
                    yAxisIndex: 0,
                    color: this.chartService.primaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            ],
        };
    }
}
