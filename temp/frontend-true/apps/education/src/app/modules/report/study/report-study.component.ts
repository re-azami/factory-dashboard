import { Component } from '@angular/core';

import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { NgxHelperDurationPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IEducationExportStudyRq, IEducationExportStudyRs, IEducationReportStudyRs } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

@Component({
    host: { selector: 'report-study' },
    templateUrl: './report-study.component.html',
    styleUrl: './report-study.component.scss',
    standalone: false
})
export class ReportStudyComponent {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public title: IPageTitle = {
        title: 'گزارش دوره‌های برگزار شده',
        toolbar: {
            route: ['/report', 'study'],
            calendar: { types: ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
        },
    };

    public now: Date = new Date();

    public loading: boolean = true;
    public report!: IEducationReportStudyRs;
    public blocks: IPageBlock[][] = [];
    public list: 'COURSE' | 'INSTITUTE' | 'MENTOR' = 'COURSE';

    private durationPipe = new NgxHelperDurationPipe().transform;
    private pricePipe = new NgxHelperPricePipe().transform;
    private from: Date = new Date();
    private to: Date = new Date();

    constructor(
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadReport();
    }

    loadReport(): void {
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<IEducationReportStudyRs>('EducationReportStudy', { params: { from, to } }, (response) => {
            this.loading = false;
            this.report = response;

            this.blocks = [
                [{ title: 'دوره‌های برگزار شده', value: response.study }],
                [
                    { title: 'مدت', value: this.durationPipe(response.duration), ltr: true },
                    { title: 'شرکت‌کننده', value: response.participant },
                    { title: 'نفر / ساعت', value: response.hour },
                ],
                [
                    { title: 'هزینه برگزاری', value: this.pricePipe(response.expense.educator) },
                    { title: 'سایر هزینه‌ها', value: this.pricePipe(response.expense.extra) },
                    { title: 'جمع هزینه‌ها', value: this.pricePipe(response.expense.total) },
                ],
            ];
        });
    }

    getMenu(config: { course?: string; institute?: string; mentor?: string }): NgxHelperMenu[] {
        return ExportTypeList.map((type: ExportType) => ({
            title: ExportTypeInfo[type].title,
            click: () => this.export(type, config),
        }));
    }

    export(type: ExportType, config?: { course?: string; institute?: string; mentor?: string }): void {
        if (this.report.study === 0) return;

        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        const body: IEducationExportStudyRq = {
            type,
            course: config?.course || null,
            institute: config?.institute || null,
            mentor: config?.mentor || null,
        };
        this.apiService.request<IEducationExportStudyRs>(
            'EducationExportStudy',
            { body, params: { from, to } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
