import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperDurationPipe, NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationExportParticipantRq,
    IEducationExportParticipantRs,
    IEducationReportParticipantRs,
    IEducationStudyResultDTO,
    ISharedPersonnelMemberDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import {
    EducationExam,
    EducationExamInfo,
    EducationExamList,
    EducationPerformance,
    EducationPerformanceList,
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
} from '@lib/shared';
import { EducationToolsService } from '../../../providers';

interface IExam {
    count: number;
    empty: number;
    score: number;
}

@Component({
    host: { selector: 'report-participant' },
    templateUrl: './report-participant.component.html',
    styleUrl: './report-participant.component.scss',
    standalone: false
})
export class ReportParticipantComponent implements OnInit {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public educationExamList = EducationExamList;
    public educationExamInfo = EducationExamInfo;

    public title: IPageTitle = {
        title: 'گزارش شرکت‌کننده‌ها',
        actions: [
            {
                title: 'انتخاب شرکت‌کننده',
                icon: 'badge',
                action: () =>
                    this.educationToolsService.selectParticipant(
                        (participant) => this.router.navigate(['/report', 'participant', participant.id]),
                        this.participant.id,
                    ),
            },
        ],
    };

    public loading: boolean = true;
    public participant: ISharedPersonnelMemberDTO = this.activatedRoute.snapshot.data['participant'];
    public blocks: IPageBlock[][] = [];
    public results: IEducationStudyResultDTO[] = [];

    public list: IList<IEducationStudyResultDTO> = {
        type: 'دوره',
        description: (data) =>
            [
                data.exam.includes('PRACTICAL') ? `نمره آزمون عملی: ${data.participant.score.practical}` : '',
                data.exam.includes('WRITTEN') ? `نمره آزمون کتبی: ${data.participant.score.written}` : '',
                data.exam.includes('ORAL') ? `نمره آزمون شفاهی: ${data.participant.score.oral}` : '',
                data.exam.includes('ELECTRONIC') ? `نمره آزمون الکترونیکی: ${data.participant.score.electronic}` : '',
                data.certificate ? `دریافت گواهینامه: ${data.participant.certificate ? 'بلی' : 'خیر'}` : '',
            ]
                .filter((d) => !!d)
                .join(' :: '),
        columns: [
            { title: 'دوره', value: (data) => data.course.title, description: (data) => ({ en: data.code }) },
            {
                title: 'مدت',
                value: (data) => data.duration.total,
                type: 'DURATION',
                description: (data) =>
                    [
                        data.duration.theoretical ? `تئوری: ${this.durationPipe(data.duration.theoretical)}` : '',
                        data.duration.practical ? `عملی: ${this.durationPipe(data.duration.practical)}` : '',
                    ]
                        .filter((d) => !!d)
                        .join(' :: '),
            },
            {
                title: 'تاریخ',
                value: (data) => this.periodPipe({ from: data.dates[0].date, to: data.dates[data.dates.length - 1].date }),
            },
            { title: 'درصد حضور', value: (data) => data.participant.presence, type: 'NUMBER' },
            { title: 'عملکرد کلاسی', value: (data) => data.participant.performance, english: true },
        ],
    };

    public emptyPerformance: number = 0;
    public performance?: EducationPerformance;
    public exam!: { [key in EducationExam]: IExam };
    public certificate: { study: number; get: number } = { study: 0, get: 0 };

    private jalali = JalaliDateTime();
    private durationPipe = new NgxHelperDurationPipe().transform;
    private periodPipe = new NgxHelperPeriodPipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly educationToolsService: EducationToolsService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe({
            next: (data: Data) => {
                this.participant = data['participant'];
                this.loadReport();
            },
        });
    }

    loadReport(): void {
        const ID: string = this.participant.id;
        this.apiService.request<IEducationReportParticipantRs>('EducationReportParticipant', { ids: { ID } }, (response) => {
            this.loading = false;
            this.results = response;
            if (this.results.length === 0) return;

            const dates: number[] = [];
            this.emptyPerformance = 0;
            this.exam = {
                PRACTICAL: { count: 0, empty: 0, score: 0 },
                WRITTEN: { count: 0, empty: 0, score: 0 },
                ORAL: { count: 0, empty: 0, score: 0 },
                ELECTRONIC: { count: 0, empty: 0, score: 0 },
            };

            const performances: number[] = [];
            let presence: number = 0;
            let duration: number = 0;

            this.results.forEach((result) => {
                duration += result.duration.total;
                presence += result.participant.presence;
                result.dates.forEach((date) => dates.push(date.date.getTime()));

                if (result.participant.performance === null) this.emptyPerformance++;
                else performances.push(EducationPerformanceList.findIndex((p) => p === result.participant.performance));

                EducationExamList.forEach((e) => {
                    if (!result.exam.includes(e)) return;
                    this.exam[e].count++;

                    let score: number | null = null;
                    switch (e) {
                        case 'PRACTICAL':
                            score = result.participant.score.practical;
                            break;
                        case 'WRITTEN':
                            score = result.participant.score.written;
                            break;
                        case 'ORAL':
                            score = result.participant.score.oral;
                            break;
                        case 'ELECTRONIC':
                            score = result.participant.score.electronic;
                            break;
                    }

                    if (score === null) this.exam[e].empty++;
                    else this.exam[e].score += score;
                });

                if (result.certificate) {
                    this.certificate.study++;
                    if (result.participant.certificate) this.certificate.get++;
                }
            });

            presence = +(presence / this.results.length).toFixed(2);
            const first: Date = new Date(Math.min(...dates));
            const last: Date = new Date(Math.max(...dates));

            if (performances.length === 0) this.performance = undefined;
            else {
                const performance = Math.round(performances.reduce((sum: number, p) => sum + p, 0) / performances.length);
                this.performance = EducationPerformanceList[performance];
            }

            this.blocks = [
                [
                    { title: 'تعداد دوره', value: response.length },
                    { title: 'مدت زمان', value: this.durationPipe(duration), ltr: true },
                    { title: 'درصد حضور', value: presence },
                ],
                [
                    { title: 'اولین دوره', value: this.jalali.toTitle(first) },
                    { title: 'آخرین دوره', value: this.jalali.toTitle(last) },
                ],
            ];
        });
    }

    export(type: ExportType): void {
        if (!this.participant) return;

        const ID: string = this.participant.id;
        const body: IEducationExportParticipantRq = { type };
        this.apiService.request<IEducationExportParticipantRs>(
            'EducationExportParticipant',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
