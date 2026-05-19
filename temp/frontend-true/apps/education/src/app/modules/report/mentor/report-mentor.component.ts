import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperDurationPipe, NgxHelperPeriodPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationExportMentorRq,
    IEducationExportMentorRs,
    IEducationMentorDTO,
    IEducationReportMentorRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationToolsService } from '../../../providers';

@Component({
    host: { selector: 'report-mentor' },
    templateUrl: './report-mentor.component.html',
    styleUrl: './report-mentor.component.scss',
    standalone: false
})
export class ReportMentorComponent implements OnInit {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public title: IPageTitle = {
        title: 'گزارش مدرس‌ها',
        actions: [
            {
                title: 'انتخاب مدرس',
                icon: 'badge',
                action: () =>
                    this.educationToolsService.selectMentor(
                        (mentor) => this.router.navigate(['/report', 'mentor', mentor.id]),
                        this.ID,
                    ),
            },
        ],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public mentor!: IEducationMentorDTO;
    public buttons: IPageCardButton[] = [];
    public blocks: IPageBlock[][] = [];
    public studies: IEducationStudyDTO[] = [];

    public list: IList<IEducationStudyDTO> = {
        type: 'دوره',
        columns: [
            { title: 'دوره', value: (data) => data.course.title, description: (data) => ({ en: data.code }) },
            {
                title: 'تاریخ',
                value: (data) => this.periodPipe({ from: data.dates[0].date, to: data.dates[data.dates.length - 1].date }),
            },
            { title: 'شرکت‌کننده', value: (data) => data.participant.count, type: 'NUMBER' },
            { title: 'مدت (تئوری)', value: (data) => data.duration.theoretical, type: 'DURATION' },
            { title: 'مدت (عملی)', value: (data) => data.duration.practical, type: 'DURATION' },
        ],
    };

    private jalali = JalaliDateTime();
    private durationPipe = new NgxHelperDurationPipe().transform;
    private periodPipe = new NgxHelperPeriodPipe().transform;
    private pricePipe = new NgxHelperPricePipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly educationToolsService: EducationToolsService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params.subscribe({
            next: (params: Params) => {
                this.ID = params['ID'];
                this.loadReport();
            },
        });
    }

    loadReport(): void {
        const ID: string = this.ID;
        this.apiService.request<IEducationReportMentorRs>(
            'EducationReportMentor',
            { ids: { ID } },
            (response) => {
                this.loading = false;
                this.mentor = response.mentor;
                this.studies = response.studies;
                this.buttons = response.mentor.cv
                    ? [{ icon: 'download', title: 'دانلود رزومه', action: this.downloadCV.bind(this) }]
                    : [];
                if (response.studies.length === 0) return;

                this.blocks = [
                    [{ title: 'دوره‌های برگزار شده', value: response.mentor.study }],
                    [
                        { title: 'مدت', value: this.durationPipe(response.mentor.duration), ltr: true },
                        { title: 'شرکت‌کننده', value: response.mentor.participant },
                        { title: 'نفر/ ساعت', value: response.mentor.hour },
                    ],
                    [
                        { title: 'هزینه برگزاری', value: this.pricePipe(response.mentor.expense.educator) },
                        { title: 'سایر هزینه‌ها', value: this.pricePipe(response.mentor.expense.extra) },
                        { title: 'مجموع هزینه‌ها', value: this.pricePipe(response.mentor.expense.total) },
                    ],
                    [
                        { title: 'اولین دوره', value: this.jalali.toTitle(response.first) },
                        { title: 'آخرین دوره', value: this.jalali.toTitle(response.last) },
                    ],
                ];
            },
            () => this.router.navigate(['/dashboard']),
        );
    }

    downloadCV(): void {
        if (!this.mentor.cv) return;

        const path: string = this.configService.getApiUrl(this.mentor.cv);
        this.ngxHelperHttpService.download(`${this.mentor.name.first} ${this.mentor.name.last}`, path);
    }

    export(type: ExportType): void {
        const ID: string = this.mentor.id;
        const body: IEducationExportMentorRq = { type };
        this.apiService.request<IEducationExportMentorRs>('EducationExportMentor', { body, ids: { ID } }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
