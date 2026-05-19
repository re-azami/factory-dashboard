import { Component, OnDestroy, OnInit } from '@angular/core';
import { EChartsOption, SetOptionOpts } from 'echarts';
import { Subscription } from 'rxjs';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperWeightPipe } from '@webilix/ngx-helper/pipe';
import { INgxHelperValue } from '@webilix/ngx-helper/value';

import {
    ApiService,
    ILoadDashboardCargoRs,
    ILoadDashboardCargoTypeRs,
    ILoadDashboardChartRs,
    ILoadDashboardFlowRs,
} from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageBlock, IPageCardOption } from '@lib/page';
import { DeviceService, IDeviceSize, UserService } from '@lib/providers';
import { LoadCargo, LoadCargoInfo, LoadCargoList, LoadFlow, LoadFlowInfo, LoadFlowList, Storages } from '@lib/shared';

import { LoadSettingService } from '../../providers';

import { DashboardInfoComponent } from './info/dashboard-info.component';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false,
})
export class DashboardComponent implements OnInit, OnDestroy {
    public loadCargoInfo = LoadCargoInfo;

    private typeStorage = localStorage.getItem(Storages.LOAD_DASHBOARD_PERIOD);
    public typeOption: IPageCardOption = {
        index:
            this.typeStorage === 'DAY'
                ? 0
                : this.typeStorage === 'WEEK'
                ? 1
                : this.typeStorage === 'MONTH'
                ? 2
                : this.typeStorage === 'YEAR'
                ? 3
                : 5,
        icon: 'calendar_month',
        options: [
            { id: 'DAY', title: 'امروز' },
            { id: 'WEEK', title: 'هفته جاری' },
            { id: 'MONTH', title: 'ماه جاری' },
            { id: 'YEAR', title: 'امسال' },
            'DIVIDER',
            { id: 'ALL', title: 'تمام حواله‌ها' },
        ],
        action: (id) => {
            localStorage.setItem(Storages.LOAD_DASHBOARD_PERIOD, id);
            this.loadType(true);
        },
    };

    public type: {
        loading: boolean;
        block: IPageBlock[];
        data: { type: LoadCargo; title: string; color: string; count: number; weight: number }[];
    } = {
        loading: true,
        block: [],
        data: [],
    };

    public active: { loading: boolean; total: number; count: INgxHelperValue[]; chart: EChartsOption } = {
        loading: true,
        total: 0,
        count: [],
        chart: {},
    };

    public cargo: {
        loading: boolean;
        remaining: 'KILO' | 'TON';
        draft: { list: ILoadDashboardCargoRs; active: number; count: number; weight: number };
        site: { list: ILoadDashboardCargoRs; active: number; count: number; weight: number };
    } = {
        loading: true,
        remaining: this.loadSettingService.remaining,
        draft: { list: [], active: 0, count: 0, weight: 0 },
        site: { list: [], active: 0, count: 0, weight: 0 },
    };
    public floor = Math.floor;

    public chart: { loading: boolean; chartDesktop: EChartsOption; chartMobile: EChartsOption } = {
        loading: true,
        chartDesktop: {},
        chartMobile: {},
    };

    public size: IDeviceSize = this.deviceService.size;
    private onSizeChanged?: Subscription;

    private jalali = JalaliDateTime();
    private weightPipe = new NgxHelperWeightPipe();
    private refreshInterval?: any;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        this.size = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe((size: IDeviceSize) => (this.size = size));

        this.loadDashboard(true);
        this.refreshInterval = setInterval(this.loadDashboard.bind(this), 30_000);
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }

    loadDashboard(firstTime?: boolean): void {
        this.loadType(!firstTime);
        this.loadActive(!firstTime);
        this.loadCargo(!firstTime);
        this.loadChart(!firstTime);
    }

    showInfo(type: LoadCargo): void {
        this.ngxHelperBottomSheetService.open(DashboardInfoComponent, `بار ${LoadCargoInfo[type].title}`, {
            data: { type },
        });
    }

    loadType(silent: boolean): void {
        if (!this.userService.hasAccess({ access: 'LOAD_DASHBOARD_TYPE' })) return;

        const storage: string = localStorage.getItem(Storages.LOAD_DASHBOARD_PERIOD) || 'ALL';
        const period: string = ['DAY', 'WEEK', 'MONTH', 'YEAR'].includes(storage) ? storage : 'ALL';

        this.apiService.request<ILoadDashboardCargoTypeRs>(
            'LoadDashboardCargoType',
            { params: { period }, silent, loading: !silent },
            (response) => {
                this.type.loading = false;

                this.type.block = [
                    { title: 'تعداد کل حواله‌ها', value: response.count },
                    { title: 'مجموع وزنی حواله‌ها', value: response.weight },
                ];

                this.type.data = response.types.map((t) => ({
                    type: t.type,
                    title: LoadCargoInfo[t.type].title,
                    color: LoadCargoInfo[t.type].color,
                    count: t.count,
                    weight: t.weight,
                }));
            },
        );
    }

    loadActive(silent: boolean): void {
        if (!this.userService.hasAccess({ access: 'LOAD_DASHBOARD_ACTIVE' })) return;

        const getDescription = (t1: string, v1: number, t2: string, v2: number): string =>
            `${t1}: ${Helper.NUMBER.format(v1)}` + ' ‌ ‌ ‌ ‌ ‌ ' + `${t2}: ${Helper.NUMBER.format(v2)}`;

        this.apiService.request<ILoadDashboardFlowRs>('LoadDashboardFlow', { silent, loading: !silent }, (response) => {
            this.active.loading = false;
            this.active.total = response.flows.reduce((sum: number, f) => sum + f.count, 0);
            this.active.count = [];
            LoadFlowList.forEach((flow: LoadFlow) =>
                this.active.count.push({
                    title: LoadFlowInfo[flow].title,
                    value: { type: 'NUMBER', value: response.flows.find((f) => f.flow === flow)?.count || 0 },
                    description:
                        flow === 'TRAFFIC'
                            ? getDescription('ورود', response.traffic.enter, 'خروج', response.traffic.exit)
                            : flow === 'TRAFFIC_MINE'
                            ? getDescription('ورود', response.traffic_mine.enter, 'خروج', response.traffic_mine.exit)
                            : flow === 'WEIGHT'
                            ? getDescription('خالی', response.weight.empty, 'پر', response.weight.full)
                            : undefined,
                }),
            );

            this.active.chart = {
                grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 0 },
                silent: true,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    position: this.chartService.tooltipPosition(),
                    formatter: (params: any): string => {
                        if (params[0].value === 0) return '';

                        const header: string = params[0].name;
                        const data: ChartTooltipData[] = [
                            {
                                title: params[0].seriesName,
                                value: params[0].value,
                                percent: (params[0].value / this.active.total) * 100,
                            },
                        ];

                        return this.chartService.tooltip(header, data);
                    },
                },
                xAxis: {
                    type: 'category',
                    data: response.flows.map((f) => LoadFlowInfo[f.flow].title),
                    axisLabel: { fontFamily: 'Yekan', fontSize: 11, rotate: 45, overflow: 'break', width: 55 },
                    position: 'bottom',
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: { fontFamily: 'Yekan', formatter: (value: number) => Helper.NUMBER.format(value) },
                    axisLine: { show: true },
                },
                series: {
                    type: 'bar',
                    data: response.flows.map((f) => f.count),
                    name: 'حواله',
                    barMaxWidth: 20,
                    color: this.chartService.secondaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            };
        });
    }

    loadCargo(silent: boolean): void {
        if (!this.userService.hasAccess({ access: 'LOAD_DASHBOARD_CARGO' })) return;

        this.apiService.request<ILoadDashboardCargoRs>('LoadDashboardCargo', { silent, loading: !silent }, (response) => {
            this.cargo.loading = false;

            this.cargo.draft.list = response.filter((r) => r.type !== 'SITE');
            this.cargo.draft.active = this.cargo.draft.list.reduce((sum: number, d) => sum + d.daily.active, 0);
            this.cargo.draft.count = this.cargo.draft.list.reduce((sum: number, d) => sum + d.daily.count, 0);
            this.cargo.draft.weight = this.cargo.draft.list.reduce((sum: number, d) => sum + d.daily.weight, 0);

            this.cargo.site.list = response.filter((r) => r.type === 'SITE');
            this.cargo.site.active = this.cargo.site.list.reduce((sum: number, d) => sum + d.daily.active, 0);
            this.cargo.site.count = this.cargo.site.list.reduce((sum: number, d) => sum + d.daily.count, 0);
            this.cargo.site.weight = this.cargo.site.list.reduce((sum: number, d) => sum + d.daily.weight, 0);
        });
    }

    loadChart(silent: boolean): void {
        if (!this.userService.hasAccess({ access: 'LOAD_DASHBOARD_CHART' })) return;

        this.apiService.request<ILoadDashboardChartRs>('LoadDashboardChart', { silent, loading: !silent }, (response) => {
            this.chart.loading = false;
            this.chart.chartDesktop = this.getChart(response);
            this.chart.chartMobile = this.getChart([...response].slice(response.length - 14));
        });
    }

    getChart(response: ILoadDashboardChartRs): EChartsOption {
        return {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    const date: Date = params[0].data?.date;
                    if (!date) return '';

                    const item = response.find((r) => r.from.getTime() === date.getTime());
                    if (!item) return '';

                    const count: number = item.cargos.reduce((sum: number, c) => sum + c.count, 0);
                    const weight: number = item.cargos.reduce((sum: number, c) => sum + c.weight, 0);
                    if (count === 0 || weight === 0) return '';

                    const header: string = this.jalali.toTitle(params[0].data.date, { format: 'W، d N Y' });
                    const data: ChartTooltipData[] = item.cargos
                        .filter((c) => c.count !== 0)
                        .map((c) => ({
                            color: LoadCargoInfo[c.cargo].color,
                            title: LoadCargoInfo[c.cargo].title + ` (${Helper.NUMBER.format(c.count)} حواله)`,
                            value: this.weightPipe.transform(c.weight * 1000),
                        }));

                    if (data.length > 1) {
                        data.push('DIVIDER');
                        data.push({
                            title: 'مجموع' + ` (${Helper.NUMBER.format(count)} حواله)`,
                            value: this.weightPipe.transform(weight * 1000),
                        });
                    }

                    return this.chartService.tooltip(header, data);
                },
            },
            xAxis: {
                type: 'category',
                data: response.map((r) => this.jalali.toTitle(r.from, { format: 'd N' })),
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
            series: LoadCargoList.map((cargo: LoadCargo) => [
                {
                    type: 'bar',
                    stack: 'count',
                    data: response.map((r) => ({
                        value: r.cargos.find((c) => c.cargo === cargo)?.count || 0,
                        date: r.from,
                    })),
                    name: 'حواله',
                    barMaxWidth: 4,
                    yAxisIndex: 0,
                    color: this.chartService.secondaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                } as SetOptionOpts,
                {
                    type: 'bar',
                    stack: 'weight',
                    data: response.map((r) => ({
                        value: (r.cargos.find((c) => c.cargo === cargo)?.weight || 0) * 1000,
                        date: r.from,
                    })),
                    name: 'وزن',
                    barMaxWidth: 13,
                    yAxisIndex: 1,
                    color: LoadCargoInfo[cargo].color,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                } as SetOptionOpts,
            ]).flat(),
        };
    }
}
