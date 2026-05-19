import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import {
    ApiService,
    ILaboratoryExportKhatkaLocationRq,
    ILaboratoryExportKhatkaLocationRs,
    ILaboratoryReportKhatkaLocationRs,
} from '@lib/apis';
import { ChartService, ChartTooltipData } from '@lib/modules';
import { IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import {
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
    LaboratoryLine,
    LaboratoryLineInfo,
    LaboratoryLineList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LaboratoryResultList,
} from '@lib/shared';

interface IReportTest {
    begin: Date;
    end: Date;
    result: number | null;
}

interface IReportLine {
    count: number;
    min: number;
    max: number;
    average: number;
    tests: IReportTest[];
}

interface IReport {
    count: number;
    chart: EChartsOption;
    buttons: IPageCardButton[];
    lines: {
        [key in LaboratoryLine]: IReportLine;
    };
}

interface IWeightAverage {
    type: 'FEED' | 'CONCENTRATE';
    line: LaboratoryLine;
    test: LaboratoryResult;
    count: number;
    tonnage: number;
    sum: number;
}

@Component({
    host: { selector: 'report-khatka-location' },
    standalone: false,
    templateUrl: './report-khatka-location.component.html',
    styleUrl: './report-khatka-location.component.scss',
})
export class ReportKhatkaLocationComponent {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;
    public laboratoryLineList = LaboratoryLineList;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratoryResultList = LaboratoryResultList;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryKhatkaList = LaboratoryKhatkaList;
    public laboratoryKhatkaInfo = LaboratoryKhatkaInfo;

    public title: IPageTitle = {
        title: 'گزارش جامع ختکا',
        toolbar: {
            route: ['/report', 'khatka', 'location'],
            calendar: { types: ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
        },
    };

    public loading: boolean = true;
    public hasReport: boolean = true;
    public report!: { [key in LaboratoryResult]: IReport };
    public weightAverage: IWeightAverage[] = [];

    public activeTab: number = 0;
    public from!: Date;
    public to!: Date;

    private jalali = JalaliDateTime();

    constructor(
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly chartService: ChartService,
    ) {}

    setDate(values: INgxHelperCalendarValue) {
        this.from = values.period.from;
        this.to = values.period.to;
        this.loadReport();
    }

    loadReport(): void {
        if (!this.from || !this.to) return;

        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        const khatka: LaboratoryKhatka = LaboratoryKhatkaList[this.activeTab];
        this.apiService.request<ILaboratoryReportKhatkaLocationRs>(
            'LaboratoryReportKhatkaLocation',
            { params: { from, to, khatka } },
            (response) => {
                this.loading = false;
                this.hasReport = false;

                // RESET REPORT DATA
                const getReport = (test: LaboratoryResult): IReport => ({
                    count: 0,
                    chart: {},
                    buttons: ExportTypeList.map((type: ExportType) => ({
                        title: ExportTypeInfo[type].title,
                        icon: ExportTypeInfo[type].icon,
                        action: () => this.export(test, type),
                    })),
                    lines: {
                        '1': { count: 0, min: 0, max: 0, average: 0, tests: [] },
                        '2': { count: 0, min: 0, max: 0, average: 0, tests: [] },
                    },
                });
                this.report = {
                    FE: getReport('FE'),
                    FEO: getReport('FEO'),
                    GRIND: getReport('GRIND'),
                    MOISTURE: getReport('MOISTURE'),
                    SULPHUR: getReport('SULPHUR'),
                };

                // SET REPORT TESTS
                const setReport = (
                    report: IReport,
                    line: LaboratoryLine,
                    time: { begin: Date; end: Date },
                    result: number | null,
                ): void => {
                    if (result !== null) {
                        this.hasReport = true;
                        report.count++;
                        report.lines[line].count++;
                    }

                    report.lines[line].tests.push({ begin: time.begin, end: time.end, result });
                };
                response.tests.forEach((test) => {
                    setReport(this.report.FE, test.line, test.time, test.fe);
                    setReport(this.report.FEO, test.line, test.time, test.feo);
                    setReport(this.report.GRIND, test.line, test.time, test.grind);
                    setReport(this.report.MOISTURE, test.line, test.time, test.moisture);
                    setReport(this.report.SULPHUR, test.line, test.time, test.sulphur);
                });

                // SET REPORT MIN / MAX / AVERAGE
                const aggregateReport = (report: IReport, fractinal: number): void => {
                    if (report.count === 0) return;

                    LaboratoryLineList.forEach((line: LaboratoryLine) => {
                        if (report.lines[line].count === 0) return;

                        const values: number[] = report.lines[line].tests
                            .filter((test) => test.result !== null)
                            .map((test) => test.result || 0);
                        if (values.length === 0) return;

                        report.lines[line].min = Math.min(...values);
                        report.lines[line].max = Math.max(...values);
                        report.lines[line].average = +(values.reduce((s, v) => s + v, 0) / values.length).toFixed(fractinal);
                    });
                };
                aggregateReport(this.report.FE, 2);
                aggregateReport(this.report.FEO, 2);
                aggregateReport(this.report.GRIND, 0);
                aggregateReport(this.report.MOISTURE, 2);
                aggregateReport(this.report.SULPHUR, 2);

                // WEIGHT AVERAGE
                this.weightAverage = [];
                const setWeightAverage = (
                    type: 'FEED' | 'CONCENTRATE',
                    line: LaboratoryLine,
                    test: LaboratoryResult,
                    result: number | null,
                    tonnage: number,
                ): void => {
                    if (result === null) return;
                    const average = this.weightAverage.find((a) => a.type === type && a.line === line && a.test === test);
                    if (average) {
                        average.count++;
                        average.tonnage += tonnage;
                        average.sum += result * tonnage;
                    } else this.weightAverage.push({ type, line, test, count: 1, tonnage, sum: result * tonnage });
                };
                response.tests.forEach((test) => {
                    if (test.tonnage.feed !== null) {
                        setWeightAverage('FEED', test.line, 'FE', test.fe, test.tonnage.feed);
                        setWeightAverage('FEED', test.line, 'FEO', test.feo, test.tonnage.feed);
                        setWeightAverage('FEED', test.line, 'GRIND', test.grind, test.tonnage.feed);
                        setWeightAverage('FEED', test.line, 'MOISTURE', test.moisture, test.tonnage.feed);
                        setWeightAverage('FEED', test.line, 'SULPHUR', test.sulphur, test.tonnage.feed);
                    }
                    if (test.tonnage.product !== null) {
                        setWeightAverage('CONCENTRATE', test.line, 'FE', test.fe, test.tonnage.product);
                        setWeightAverage('CONCENTRATE', test.line, 'FEO', test.feo, test.tonnage.product);
                        setWeightAverage('CONCENTRATE', test.line, 'GRIND', test.grind, test.tonnage.product);
                        setWeightAverage('CONCENTRATE', test.line, 'MOISTURE', test.moisture, test.tonnage.product);
                        setWeightAverage('CONCENTRATE', test.line, 'SULPHUR', test.sulphur, test.tonnage.product);
                    }
                });

                // SET REPORT CHART
                this.setChart(this.report.FE);
                this.setChart(this.report.FEO);
                this.setChart(this.report.GRIND);
                this.setChart(this.report.MOISTURE);
                this.setChart(this.report.SULPHUR);
            },
        );
    }

    getWeightAverage(
        type: 'FEED' | 'CONCENTRATE',
        line: LaboratoryLine,
        test: LaboratoryResult,
    ): { count: number; tonnage: number; average: number } | null {
        const fractinal: number = test === 'GRIND' ? 0 : 2;
        const average = this.weightAverage.find((a) => a.type === type && a.line === line && a.test === test);
        return average
            ? {
                  count: average.count,
                  tonnage: average.tonnage,
                  average: +(average.sum / average.tonnage).toFixed(fractinal),
              }
            : null;
    }

    setChart(report: IReport): void {
        const setDate = (line: LaboratoryLine, report: IReportLine): void => {
            report.tests.forEach((test) => {
                if (test.result === null) return;

                const title: string = this.jalali.toTitle(test.begin, { format: 'Y/M/D' });
                let date = dates.find((d) => d.title === title);
                if (!date) {
                    date = { title, date: test.begin, values: { '1': 0, '2': 0 }, tests: { '1': [], '2': [] } };
                    dates.push(date);
                }
                date.tests[line].push({ ...test, result: test.result });
                date.tests[line] = date.tests[line].sort((t1, t2) => t1.begin.getTime() - t2.begin.getTime());
                date.values[line] = +(date.tests[line].reduce((s, t) => s + t.result, 0) / date.tests[line].length).toFixed(
                    2,
                );
            });
        };

        let dates: {
            title: string;
            date: Date;
            values: { [key in LaboratoryLine]: number };
            tests: { [key in LaboratoryLine]: { begin: Date; end: Date; result: number }[] };
        }[] = [];
        setDate('1', report.lines['1']);
        setDate('2', report.lines['2']);
        dates = dates.sort((d1, d2) => d1.title.localeCompare(d2.title));

        // YAXIS MINIMUM VALUE
        const values: number[] = dates
            .map((date) => [date.values['1'], date.values['2']])
            .flat()
            .filter((v) => v > 0);
        const min: number = Math.min(...values);

        report.chart = {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                position: this.chartService.tooltipPosition(),
                formatter: (params: any): string => {
                    const count: number = params[0].value + params[1].value;
                    if (count === 0) return '';

                    const index: number = params[0].dataIndex;
                    const header: string = this.jalali.toTitle(dates[index].date);
                    const data: ChartTooltipData[] = [];
                    if (params[0].value) {
                        data.push({ color: params[0].color, title: params[0].seriesName, value: '' });
                        dates[index].tests['1'].forEach((test) => {
                            const title =
                                this.jalali.toTime(test.begin, { format: 'H:I' }) +
                                ' تا ' +
                                this.jalali.toTime(test.end, { format: 'H:I' });
                            data.push({ title, value: test.result });
                        });
                        if (dates[index].tests['1'].length > 1) data.push({ title: 'متوسط', value: params[0].value });
                    }
                    if (params[0].value && params[1].value) data.push('DIVIDER');
                    if (params[1].value) {
                        data.push({ color: params[1].color, title: params[1].seriesName, value: '' });
                        dates[index].tests['2'].forEach((test) => {
                            const title =
                                this.jalali.toTime(test.begin, { format: 'H:I' }) +
                                ' تا ' +
                                this.jalali.toTime(test.end, { format: 'H:I' });
                            data.push({ title, value: test.result });
                        });
                        if (dates[index].tests['2'].length > 1) data.push({ title: 'متوسط', value: params[1].value });
                    }

                    return this.chartService.tooltip(header, data);
                },
            },
            xAxis: {
                type: 'category',
                data: dates.map(() => ''),
                axisLabel: { fontFamily: 'Yekan', fontSize: 11, rotate: 90 },
                position: 'bottom',
                boundaryGap: false,
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                axisLabel: { fontFamily: 'Yekan', formatter: (value: number) => Helper.NUMBER.format(value) },
                axisLine: { show: true },
                min: Math.round(min - (min % 10)),
            },
            series: [
                {
                    name: LaboratoryLineInfo['1'].title,
                    type: 'line',
                    data: dates.map((date) => (date.tests['1'].length === 0 ? null : date.values['1'])),
                    symbolSize: 0,
                    animation: false,
                    color: '#1da756',
                },
                {
                    name: LaboratoryLineInfo['2'].title,
                    type: 'line',
                    data: dates.map((date) => (date.tests['2'].length === 0 ? null : date.values['2'])),
                    symbolSize: 0,
                    animation: false,
                    color: '#0068b3',
                },
            ],
        };
    }

    export(test: LaboratoryResult, type: ExportType, line?: LaboratoryLine): void {
        if (!this.from || !this.to) return;

        const body: ILaboratoryExportKhatkaLocationRq = {
            from: this.from,
            to: this.to,
            khatka: LaboratoryKhatkaList[this.activeTab],
            test,
            line: line || null,
            type,
        };
        this.apiService.request<ILaboratoryExportKhatkaLocationRs>(
            'LaboratoryExportKhatkaLocation',
            { body },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
