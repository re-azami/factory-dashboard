import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime, JalaliDateTimeCalendar } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import {
    ApiService,
    ILaboratoryDailyDownloadRq,
    ILaboratoryDailyDownloadRs,
    ILaboratoryDashboardDailyDTO,
    ILaboratoryDashboardDailyRs,
} from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageCardButton } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { LaboratoryResultInfo } from '@lib/shared';

@Component({
    selector: 'dashboard-daily',
    templateUrl: './dashboard-daily.component.html',
    styleUrl: './dashboard-daily.component.scss',
    standalone: false
})
export class DashboardDailyComponent implements OnInit {
    public laboratoryResultInfo = LaboratoryResultInfo;

    private viewAccess: boolean = this.userService.hasAccess({
        access: [
            'LABORATORY_CRUSHER',
            'LABORATORY_KHATKA',
            'LABORATORY_BLAINE',
            'LABORATORY_DAVIS',
            'LABORATORY_SOLID',
            'LABORATORY_LOAD',
            'LABORATORY_ROLE_LOAD',
            'LABORATORY_ROLE_TECHNICIAN',
        ],
    });

    public buttons: IPageCardButton[] = [];
    public menu: NgxHelperMenu[] = [];

    private jalali = JalaliDateTime();
    public days: string[] = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    public today: string = this.jalali.toDate(new Date());

    public loading: boolean = true;
    public dates: ILaboratoryDashboardDailyDTO[] = [];
    public data: { [key: string]: ILaboratoryDashboardDailyDTO } = {};
    public chart: EChartsOption = {};

    public date: Date = new Date();
    public current: string = this.jalali.toDate(this.date);
    public month: string = this.jalali.toString(new Date(), { format: 'Y-M' });
    public calendar: JalaliDateTimeCalendar = this.jalali.calendar(this.month);

    constructor(
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        if (this.viewAccess) this.buttons.push({ title: 'مشاهده نتایج', icon: 'biotech', action: this.viewDate.bind(this) });

        const crusherAccess: boolean = this.userService.hasAccess({
            access: ['LABORATORY_CRUSHER', 'LABORATORY_ROLE_TECHNICIAN'],
        });
        const khatkaAccess: boolean = this.userService.hasAccess({
            access: ['LABORATORY_KHATKA', 'LABORATORY_ROLE_TECHNICIAN'],
        });
        if (crusherAccess) this.menu.push({ title: 'نتایج سنگ شکن', click: () => this.exportDate('CRUSHER') });
        if (khatkaAccess) this.menu.push({ title: 'نتایج ختکا', click: () => this.exportDate('KHATKA') });
        this.menu.push('DIVIDER');
        if (crusherAccess && khatkaAccess) this.menu.push({ title: 'هر دو مورد', click: () => this.exportDate('BOTH') });

        this.loadTesting();
    }

    loadTesting(): void {
        const date: Date = this.jalali.periodDay(1, new Date(this.jalali.gregorian(`${this.month}-01`).date)).from;
        this.apiService.request<ILaboratoryDashboardDailyRs>(
            'LaboratoryDashboardDaily',
            { params: { date: date.toISOString() }, silent: true, loading: false },
            (response) => {
                this.loading = false;
                this.dates = response.dates;

                this.data = {};
                response.dates.forEach((date) => (this.data[date.date] = date));

                const date: string =
                    response.dates.length === 0 ? `${this.month}-01` : response.dates[response.dates.length - 1].date;
                this.setDate(date);
            },
        );
    }

    setData(): void {
        this.current = this.jalali.toDate(this.date);
        this.month = this.current.substring(0, 7);
        this.calendar = this.jalali.calendar(this.month);
    }

    setMonth(change: number): void {
        let [y, m] = this.month.split('-').map((v) => +v);
        m += change;
        if (m === 0) {
            m = 12;
            y--;
        }
        if (m === 13) {
            m = 1;
            y++;
        }

        this.month = `${y}-${m.toString().padStart(2, '0')}`;
        this.calendar = this.jalali.calendar(this.month);
        this.loadTesting();
    }

    setDate(jalali: string): void {
        if (jalali > this.today) return;
        if (jalali === this.current) return;
        if (jalali.substring(0, 7) !== this.month) return;

        const gregorian = this.jalali.gregorian(jalali).date;
        this.date = this.jalali.periodDay(1, new Date(gregorian)).from;
        this.setData();
        this.setChart();
    }

    viewDate(): void {
        if (!this.viewAccess) return;

        this.router.navigate(['/daily'], {
            queryParams: {
                'ngx-helper-calendar-type': 'DAY',
                'ngx-helper-calendar-from': this.current,
                'ngx-helper-calendar-to': this.current,
            },
        });
    }

    exportDate(type: 'CRUSHER' | 'KHATKA' | 'BOTH'): void {
        const body: ILaboratoryDailyDownloadRq = { date: this.date };
        this.apiService.request<ILaboratoryDailyDownloadRs>(
            'LaboratoryDailyDownload',
            { body, params: { type } },
            (response) => {
                const url: string = this.configService.getApiUrl(response.path);
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, url);
            },
        );
    }

    setChart(): void {
        const dayInMonth: number = this.jalali.daysInMonth(this.month);
        const days: string[] = [...Array(dayInMonth)].map(
            (_, index: number) => `${this.month}-${(index + 1).toString().padStart(2, '0')}`,
        );

        this.chart = {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 0 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    const count: number = params[0].value + params[1].value;
                    if (count === 0) return '';

                    const header: string = this.jalali.toTitle(new Date(this.jalali.gregorian(params[0].data.day).date));
                    const data: ChartTooltipData[] = [
                        { color: params[0].color, title: params[0].seriesName, value: params[0].value },
                        { color: params[1].color, title: params[1].seriesName, value: params[1].value },
                        'DIVIDER',
                        { color: params[2].color, title: params[2].seriesName, value: params[2].value },
                        { color: params[3].color, title: params[3].seriesName, value: params[3].value },
                        { color: params[4].color, title: params[4].seriesName, value: params[4].value },
                        { color: params[5].color, title: params[5].seriesName, value: params[5].value },
                        { color: params[6].color, title: params[6].seriesName, value: params[6].value },
                    ];

                    return this.chartService.tooltip(header, data);
                },
            },
            xAxis: {
                type: 'category',
                data: days.map((day) => this.jalali.toTitle(new Date(this.jalali.gregorian(day).date), { format: 'D' })),
                axisLabel: { fontFamily: 'Yekan', fontSize: 11, rotate: 45, overflow: 'break', width: 55 },
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
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.tests.crusher || 0,
                        day,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: 'سنگ شکن',
                    stack: 'test',
                    barMaxWidth: 4,
                    color: '#0068b3',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.tests.khatka || 0,
                        day,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: 'ختکا',
                    stack: 'test',
                    barMaxWidth: 4,
                    color: 'rgb(18, 140, 126)',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },

                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.results.fe,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: LaboratoryResultInfo['FE'].title,
                    stack: 'result',
                    barMaxWidth: 7,
                    color: '#ff6600',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.results.feo,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: LaboratoryResultInfo['FEO'].title,
                    stack: 'result',
                    barMaxWidth: 7,
                    color: '#ff9933',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.results.grind,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: LaboratoryResultInfo['GRIND'].title,
                    stack: 'result',
                    barMaxWidth: 7,
                    color: '#0068b3',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.results.moisture,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: LaboratoryResultInfo['MOISTURE'].title,
                    stack: 'result',
                    barMaxWidth: 7,
                    color: '#33aaff',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
                {
                    type: 'bar',
                    data: days.map((day) => ({
                        value: this.dates.find((d) => d.date === day)?.results.sulphur,
                        itemStyle: { opacity: day === this.current ? 1 : 0.5 },
                    })),
                    name: LaboratoryResultInfo['SULPHUR'].title,
                    stack: 'result',
                    barMaxWidth: 7,
                    color: '#1da756',
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            ],
        };
    }
}
