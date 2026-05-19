import { Component } from '@angular/core';

import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILoadReportDailyTransporterRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'report-daily-transporter' },
    templateUrl: './report-daily-transporter.component.html',
    styleUrl: './report-daily-transporter.component.scss',
    standalone: false
})
export class ReportDailyTransporterComponent {
    public loadCargoInfo = LoadCargoInfo;

    public title: IPageTitle = {
        title: 'گزارش روزانه باربری',
        toolbar: {
            route: ['/report', 'daily-transporter'],
            calendar: { types: ['DAY'], maxDate: new Date() },
        },
    };

    public loading: boolean = true;
    public report: ILoadReportDailyTransporterRs = [];

    constructor(private readonly apiService: ApiService) {}

    loadReport(values: INgxHelperCalendarValue): void {
        const from: string = values.period.from.toJSON();
        const to: string = values.period.to.toJSON();
        this.apiService.request<ILoadReportDailyTransporterRs>(
            'LoadReportDailyTransporter',
            { params: { from, to } },
            (response) => {
                this.loading = false;
                this.report = response;
            },
        );
    }

    getTotalCount(id: string): number | undefined {
        const transporter = this.report.find((t) => t.transporter.id === id);
        if (!transporter || transporter.cargos.length < 2) return undefined;

        return transporter.cargos.reduce((sum: number, c) => sum + c.count, 0);
    }

    getTotalWeight(id: string): number | undefined {
        const transporter = this.report.find((t) => t.transporter.id === id);
        if (!transporter || transporter.cargos.length < 2) return undefined;

        return transporter.cargos.reduce((sum: number, c) => sum + c.weight, 0);
    }
}
