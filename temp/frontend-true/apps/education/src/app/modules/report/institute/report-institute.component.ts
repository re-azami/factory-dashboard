import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperDurationPipe, NgxHelperPeriodPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationExportInstituteRq,
    IEducationExportInstituteRs,
    IEducationInstituteDTO,
    IEducationReportInstituteRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationToolsService } from '../../../providers';

@Component({
    host: { selector: 'report-institute' },
    templateUrl: './report-institute.component.html',
    styleUrl: './report-institute.component.scss',
    standalone: false
})
export class ReportInstituteComponent implements OnInit {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public title: IPageTitle = {
        title: 'گزارش موسسه‌ها',
        actions: [
            {
                title: 'انتخاب موسسه',
                icon: 'business',
                action: () =>
                    this.educationToolsService.selectInstitute(
                        (institute) => this.router.navigate(['/report', 'institute', institute.id]),
                        this.ID,
                    ),
            },
        ],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public institute!: IEducationInstituteDTO;
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
        private router: Router,
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
        this.apiService.request<IEducationReportInstituteRs>(
            'EducationReportInstitute',
            { ids: { ID } },
            (response) => {
                this.loading = false;
                this.institute = response.institute;
                this.studies = response.studies;
                if (response.studies.length === 0) return;

                this.blocks = [
                    [{ title: 'دوره‌های برگزار شده', value: response.institute.study }],
                    [
                        { title: 'مدت', value: this.durationPipe(response.institute.duration), ltr: true },
                        { title: 'شرکت‌کننده', value: response.institute.participant },
                        { title: 'نفر/ ساعت', value: response.institute.hour },
                    ],
                    [
                        { title: 'هزینه برگزاری', value: this.pricePipe(response.institute.expense.educator) },
                        { title: 'سایر هزینه‌ها', value: this.pricePipe(response.institute.expense.extra) },
                        { title: 'مجموع هزینه‌ها', value: this.pricePipe(response.institute.expense.total) },
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

    export(type: ExportType): void {
        const ID: string = this.institute.id;
        const body: IEducationExportInstituteRq = { type };
        this.apiService.request<IEducationExportInstituteRs>(
            'EducationExportInstitute',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
