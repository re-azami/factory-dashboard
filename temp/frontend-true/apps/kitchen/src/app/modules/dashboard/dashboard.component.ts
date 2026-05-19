import { Component, OnDestroy, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

import {
    ApiService,
    IKitchenDashboardCalendarDTO,
    IKitchenDashboardCalendarRs,
    IKitchenDashboardCountRs,
    IKitchenDashboardInventoryRs,
    IKitchenDashboardServingRs,
    IKitchenGoodDTO,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageCardOption } from '@lib/page';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { DeviceService, IDeviceSize, UserService } from '@lib/providers';
import { KitchenMeal, KitchenMealInfo, KitchenMealList, Storages } from '@lib/shared';

import { KitchenUnitService } from '../../providers';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false,
})
export class DashboardComponent implements OnInit, OnDestroy {
    public kitchenMealList = KitchenMealList;
    public kitchenMealInfo = KitchenMealInfo;

    public count: {
        loading: boolean;
        blocks: IPageBlock[];
        meals: { [key in KitchenMeal]: { count: number; serving: number } };
        chart: EChartsOption;
    } = {
        loading: true,
        blocks: [],
        meals: { BREAKFAST: { count: 0, serving: 0 }, LUNCH: { count: 0, serving: 0 }, DINNER: { count: 0, serving: 0 } },
        chart: {},
    };
    private countStorage = localStorage.getItem(Storages.KITCHEN_DASHBOARD_PERIOD);
    public countOption: IPageCardOption = {
        index: this.countStorage === 'WEEK' ? 0 : this.countStorage === 'MONTH' ? 1 : this.countStorage === 'YEAK' ? 2 : 4,
        icon: 'calendar_month',
        options: [
            { id: 'WEEK', title: 'هفته جاری' },
            { id: 'MONTH', title: 'ماه جاری' },
            { id: 'YEAR', title: 'امسال' },
            'DIVIDER',
            { id: 'ALL', title: 'همه موارد' },
        ],
        action: (id) => {
            localStorage.setItem(Storages.KITCHEN_DASHBOARD_PERIOD, id);
            this.loadCount(true);
        },
    };

    public calendar: {
        loading: boolean;
        date: Date;
        period: { from: Date; to: Date };
        days: { date: Date; meals: { [key in KitchenMeal]: IKitchenDashboardCalendarDTO | null } }[];
    } = { loading: true, date: new Date(), period: { from: new Date(), to: new Date() }, days: [] };
    public calendarButtons: IPageCardButton[] = [
        { title: '', icon: 'arrow_forward_ios', action: () => this.loadCalendar('P'), showIcon: true },
        { title: '', icon: 'adjust', action: () => this.loadCalendar('C'), showIcon: true },
        { title: '', icon: 'arrow_back_ios', action: () => this.loadCalendar('N'), showIcon: true },
    ];
    public calendarMeal: { index: number; meal: KitchenMeal } = { index: -1, meal: 'BREAKFAST' };
    private calendarMealInterval: any;

    public serving: { loading: boolean; chartDesktop: EChartsOption; chartMobile: EChartsOption } = {
        loading: true,
        chartDesktop: {},
        chartMobile: {},
    };

    public inventory: { loading: boolean; blocks: IPageBlock[] } = { loading: true, blocks: [] };

    public servingAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_SERVING' });

    public deviceSize!: IDeviceSize;
    private onSizeChanged?: Subscription;

    private jalali = JalaliDateTime();

    constructor(
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly chartService: ChartService,
        private readonly userService: UserService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    ngOnInit(): void {
        this.deviceSize = this.deviceService.size;
        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe({
            next: (size: IDeviceSize) => (this.deviceSize = size),
        });

        this.setCalendarMeal();
        this.calendarMealInterval = setInterval(this.setCalendarMeal.bind(this), 30 * 1000);

        this.loadCount(false);
        this.loadCalendar();
        this.loadServing();
        this.loadInventory();
    }

    ngOnDestroy(): void {
        this.onSizeChanged?.unsubscribe();
        if (this.calendarMealInterval) clearInterval(this.calendarMealInterval);
    }

    setCalendarMeal(): void {
        if (this.calendar.loading) return;

        const getString = (date: Date): string => this.jalali.toString(date, { format: 'Y-M-D' });

        const today: string = getString(new Date());
        const index: number = this.calendar.days.findIndex((day) => getString(day.date) === today);

        const hour: number = new Date().getHours();
        const meal: KitchenMeal = hour < 10 ? 'BREAKFAST' : hour < 17 ? 'LUNCH' : 'DINNER';

        if (this.calendarMeal.index === index && this.calendarMeal.meal === meal) return;
        this.calendarMeal = { index, meal };
    }

    loadCount(silent: boolean): void {
        const getMeal = (response: IKitchenDashboardCountRs, meal: KitchenMeal): { count: number; serving: number } => {
            const data = response.meals.find((r) => r.meal === meal);
            return { count: data?.count || 0, serving: data?.serving || 0 };
        };

        const storage: string = localStorage.getItem(Storages.KITCHEN_DASHBOARD_PERIOD) || 'ALL';
        const period: string = ['WEEK', 'MONTH', 'YEAR'].includes(storage) ? storage : 'ALL';

        this.apiService.request<IKitchenDashboardCountRs>(
            'KitchenDashboardCount',
            { params: { period }, silent, loading: !silent },
            (response) => {
                this.count = {
                    loading: false,
                    blocks: [
                        { title: 'کالاهای فعال', value: response.good },
                        { title: 'غذاهای فعال', value: response.recipe },
                        { title: 'سرو برنامه‌ریزی شده', value: response.serving.active },
                        { title: 'سرو انجام شده', value: response.serving.done },
                    ],
                    meals: {
                        BREAKFAST: getMeal(response, 'BREAKFAST'),
                        LUNCH: getMeal(response, 'LUNCH'),
                        DINNER: getMeal(response, 'DINNER'),
                    },
                    chart: {
                        grid: { containLabel: true, left: 0, right: 0, top: 0, bottom: 0 },
                        silent: true,
                        series: [
                            {
                                type: 'pie',
                                radius: ['45%', '50%'],
                                avoidLabelOverlap: false,
                                label: { show: false },
                                emphasis: { label: { show: false } },
                                labelLine: { show: false },
                                data: KitchenMealList.map((meal) => ({
                                    value: response.meals.find((m) => m.meal === meal)?.count || 0,
                                    itemStyle: { color: KitchenMealInfo[meal].color, borderWidth: 1, borderColor: '#FFF' },
                                })),
                            },
                            {
                                type: 'pie',
                                radius: ['55%', '90%'],
                                avoidLabelOverlap: false,
                                label: { show: false },
                                emphasis: { label: { show: false } },
                                labelLine: { show: false },
                                data: KitchenMealList.map((meal) => ({
                                    value: response.meals.find((m) => m.meal === meal)?.serving || 0,
                                    itemStyle: { color: KitchenMealInfo[meal].color, borderWidth: 1, borderColor: '#FFF' },
                                })),
                            },
                        ],
                    },
                };
            },
        );
    }

    loadCalendar(change?: 'C' | 'P' | 'N'): void {
        if (!this.userService.hasAccess({ access: 'KITCHEN_DASHBOARD_CALENDAR' })) return;

        switch (change) {
            case 'C':
                this.calendar.date = new Date();
                break;
            case 'P':
                this.calendar.date = new Date(this.calendar.period.from.getTime() - 1000);
                break;
            case 'N':
                this.calendar.date = new Date(this.calendar.period.to.getTime() + 1000);
                break;
        }

        const { from, to } = this.jalali.periodWeek(1, this.calendar.date);
        this.calendar.period = { from, to };

        this.apiService.request<IKitchenDashboardCalendarRs>(
            'KitchenDashboardCalendar',
            { params: { from: from.toJSON(), to: to.toJSON() }, silent: !!change, loading: !change },
            (response) => {
                const getString = (date: Date): string => this.jalali.toString(date, { format: 'Y-M-D' });
                const findMeal = (jalali: string, meal: KitchenMeal): IKitchenDashboardCalendarDTO | null =>
                    response.find((serving) => getString(serving.date) === jalali && serving.meal === meal) || null;

                this.calendar.loading = false;
                this.calendar.days = [];
                for (var d = 0; d < 7; d++) {
                    const date: Date = this.jalali.periodDay(1, new Date(from.getTime() + d * 24 * 3600 * 1000)).from;
                    const jalaliDate = getString(date);

                    this.calendar.days.push({
                        date,
                        meals: {
                            BREAKFAST: findMeal(jalaliDate, 'BREAKFAST'),
                            LUNCH: findMeal(jalaliDate, 'LUNCH'),
                            DINNER: findMeal(jalaliDate, 'DINNER'),
                        },
                    });
                }

                this.setCalendarMeal();
            },
        );
    }

    loadServing(): void {
        if (!this.userService.hasAccess({ access: 'KITCHEN_DASHBOARD_SERVING' })) return;

        this.apiService.request<IKitchenDashboardServingRs>('KitchenDashboardServing', (response) => {
            const getChart = (data: IKitchenDashboardServingRs): EChartsOption => ({
                grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
                silent: true,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    position: this.chartService.tooltipPosition(),
                    formatter: (params: any): string => {
                        const date: Date = params[0].data?.date;
                        if (!date) return '';

                        const item = data.find((i) => i.from.getTime() === date.getTime());
                        if (!item) return '';

                        const count: number = item.serving.breakfast + item.serving.lunch + item.serving.dinner;
                        if (!count) return '';

                        const header: string = this.jalali.toTitle(params[0].data.date, { format: 'W، d N Y' });
                        const tooltip: ChartTooltipData[] = [];
                        if (item.serving.breakfast)
                            tooltip.push({
                                color: KitchenMealInfo.BREAKFAST.color,
                                title: KitchenMealInfo.BREAKFAST.title,
                                value: item.serving.breakfast,
                            });
                        if (item.serving.lunch)
                            tooltip.push({
                                color: KitchenMealInfo.LUNCH.color,
                                title: KitchenMealInfo.LUNCH.title,
                                value: item.serving.lunch,
                            });
                        if (item.serving.dinner)
                            tooltip.push({
                                color: KitchenMealInfo.DINNER.color,
                                title: KitchenMealInfo.DINNER.title,
                                value: item.serving.dinner,
                            });
                        if (tooltip.length > 1) tooltip.push('DIVIDER', { title: 'مجموع', value: count });

                        return this.chartService.tooltip(header, tooltip);
                    },
                },
                xAxis: {
                    type: 'category',
                    data: data.map((i) => this.jalali.toTitle(i.from, { format: 'd N' })),
                    axisLabel: { fontFamily: 'Yekan', fontSize: 11, rotate: 45 },
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
                        stack: 'serving',
                        data: data.map((i) => ({ value: i.serving.breakfast, date: i.from })),
                        name: KitchenMealInfo.BREAKFAST.title,
                        color: KitchenMealInfo.BREAKFAST.color,
                        barMaxWidth: 13,
                        showBackground: true,
                        backgroundStyle: { color: this.chartService.backgroundColor },
                    },
                    {
                        type: 'bar',
                        stack: 'serving',
                        data: data.map((i) => ({ value: i.serving.lunch, date: i.from })),
                        name: KitchenMealInfo.LUNCH.title,
                        color: KitchenMealInfo.LUNCH.color,
                        barMaxWidth: 13,
                        showBackground: true,
                        backgroundStyle: { color: this.chartService.backgroundColor },
                    },
                    {
                        type: 'bar',
                        stack: 'serving',
                        data: data.map((i) => ({ value: i.serving.dinner, date: i.from })),
                        barMaxWidth: 13,
                        name: KitchenMealInfo.DINNER.title,
                        color: KitchenMealInfo.DINNER.color,
                        showBackground: true,
                        backgroundStyle: { color: this.chartService.backgroundColor },
                    },
                ],
            });

            this.serving = {
                loading: false,
                chartDesktop: getChart(response),
                chartMobile: getChart([...response].slice(response.length - 14)),
            };
        });
    }

    loadInventory(): void {
        if (!this.userService.hasAccess({ access: ['KITCHEN_GOOD', 'KITCHEN_DASHBOARD_INVENTORY'] })) return;

        this.apiService.request<IKitchenDashboardInventoryRs>(
            'KitchenDashboardInventory',
            (response) =>
                (this.inventory = {
                    loading: false,
                    blocks: response.map((good: IKitchenGoodDTO) => ({
                        title: good.title,
                        value: this.kitchenUnitService.valueTitle(good.unit, good.inventory),
                        color: good.inventory < 0 ? 'warn' : good.inventory === 0 ? 'accent' : undefined,
                    })),
                }),
        );
    }
}
