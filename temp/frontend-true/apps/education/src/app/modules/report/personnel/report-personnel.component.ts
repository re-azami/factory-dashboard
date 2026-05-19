import { Component } from '@angular/core';

import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';
import { NgxHelperDurationPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationExportPersonnelRq,
    IEducationExportPersonnelRs,
    IEducationReportPersonnelDTO,
    IEducationReportPersonnelRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

@Component({
    host: { selector: 'report-personnel' },
    templateUrl: './report-personnel.component.html',
    styleUrl: './report-personnel.component.scss',
    standalone: false
})
export class ReportPersonnelComponent {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public title: IPageTitle = {
        title: 'گزارش دوره‌ای امتیاز پرسنل',
        toolbar: {
            route: ['/report', 'personnel'],
            calendar: { types: ['MONTH', 'WEEK', 'YEAR', 'PERIOD'], maxDate: new Date() },
        },
    };

    public loading: boolean = true;
    public participants: IEducationReportPersonnelDTO[] = [];
    public blocks: IPageBlock[][] = [];

    public list: IList<IEducationReportPersonnelDTO> = {
        type: 'دوره',
        columns: [
            { title: 'پرسنل', value: 'name' },
            { title: 'کد پرسنلی', value: 'code', english: true, isDescription: true },
            { title: 'واحد', value: (data) => data.department.title },
            { title: 'سمت', value: (data) => data.position.title },
            { title: 'تعداد دوره', value: 'study', type: 'NUMBER' },
            { title: 'مدت دوره‌ها', value: 'duration', type: 'DURATION' },
        ],
    };

    private durationPipe = new NgxHelperDurationPipe().transform;
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
        this.apiService.request<IEducationReportPersonnelRs>(
            'EducationReportPersonnel',
            { params: { from, to } },
            (response) => {
                this.loading = false;
                this.participants = response.participants.sort((p1, p2) =>
                    p1.study !== p2.study ? p2.study - p1.study : p1.name.localeCompare(p2.name),
                );

                this.blocks = [
                    [
                        { title: 'شرکت‌کننده', value: this.participants.length },
                        { title: 'شرکت در دوره', value: response.participant },
                    ],
                    [
                        { title: 'دوره', value: response.study },
                        { title: 'مدت', value: this.durationPipe(response.duration), ltr: true },
                        { title: 'نفر / ساعت', value: response.hour },
                    ],
                ];
            },
        );
    }

    export(type: ExportType): void {
        if (this.participants.length === 0) return;

        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        const body: IEducationExportPersonnelRq = { type };
        this.apiService.request<IEducationExportPersonnelRs>(
            'EducationExportPersonnel',
            { body, params: { from, to } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
