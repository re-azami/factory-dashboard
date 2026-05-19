import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EChartsOption } from 'echarts';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService } from '@webilix/ngx-helper';
import { NgxHelperDurationPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationCourseDTO,
    IEducationExportCourseInstituteRq,
    IEducationExportCourseInstituteRs,
    IEducationExportCourseMentorRq,
    IEducationExportCourseMentorRs,
    IEducationExportCourseRq,
    IEducationExportCourseRs,
    IEducationReportCourseRs,
} from '@lib/apis';
import { ChartService } from '@lib/modules';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationToolsService } from '../../../providers';

@Component({
    host: { selector: 'report-course' },
    templateUrl: './report-course.component.html',
    styleUrl: './report-course.component.scss',
    standalone: false
})
export class ReportCourseComponent implements OnInit {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public title: IPageTitle = {
        title: 'گزارش دوره‌ها',
        actions: [
            {
                title: 'انتخاب دوره',
                icon: 'description',
                action: () =>
                    this.educationToolsService.selectCourse(
                        (course) => this.router.navigate(['/report', 'course', course.id]),
                        this.ID,
                    ),
            },
        ],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public course!: IEducationCourseDTO;
    public blocks: IPageBlock[][] = [];
    public instituteChart?: EChartsOption;
    public mentorChart?: EChartsOption;

    public instituteButtons: IPageCardButton[] = ExportTypeList.map((type: ExportType) => ({
        icon: ExportTypeInfo[type].icon,
        title: ExportTypeInfo[type].title,
        action: () => this.exportInstitute(type),
    }));

    public mentorButtons: IPageCardButton[] = ExportTypeList.map((type: ExportType) => ({
        icon: ExportTypeInfo[type].icon,
        title: ExportTypeInfo[type].title,
        action: () => this.exportMentor(type),
    }));

    private jalali = JalaliDateTime();
    private durationPipe = new NgxHelperDurationPipe().transform;
    private pricePipe = new NgxHelperPricePipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly chartService: ChartService,
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
        this.apiService.request<IEducationReportCourseRs>(
            'EducationReportCourse',
            { ids: { ID } },
            (response) => {
                this.loading = false;
                this.course = response.course;
                if (response.course.study === 0) return;

                this.blocks = [
                    [{ title: 'برگزاری', value: response.course.study }],
                    [
                        { title: 'مدت', value: this.durationPipe(response.course.duration), ltr: true },
                        { title: 'شرکت‌کننده', value: response.course.participant },
                        { title: 'نفر/ ساعت', value: response.course.hour },
                    ],
                    [
                        { title: 'هزینه برگزاری', value: this.pricePipe(response.course.expense.educator) },
                        { title: 'سایر هزینه‌ها', value: this.pricePipe(response.course.expense.extra) },
                        { title: 'مجموع هزینه‌ها', value: this.pricePipe(response.course.expense.total) },
                    ],
                    [
                        { title: 'اولین دوره', value: this.jalali.toTitle(response.first) },
                        { title: 'آخرین دوره', value: this.jalali.toTitle(response.last) },
                    ],
                ];

                this.instituteChart = response.institutes.length !== 0 ? this.getChart(response.institutes) : undefined;
                this.mentorChart = response.mentors.length !== 0 ? this.getChart(response.mentors) : undefined;
            },
            () => this.router.navigate(['/dashboard']),
        );
    }

    getChart(data: { id: string; title: string; study: number }[]): EChartsOption {
        return {
            grid: { containLabel: true, left: 16, right: 16, top: 16, bottom: 16 },
            silent: true,
            xAxis: {
                type: 'category',
                data: data.map((d) => d.title),
                axisLabel: { fontFamily: 'Yekan', fontSize: 11 },
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
                    data: data.map((d) => d.study),
                    name: 'تعداد دوره',
                    barMaxWidth: 13,
                    color: this.chartService.primaryColor,
                    showBackground: true,
                    backgroundStyle: { color: this.chartService.backgroundColor },
                },
            ],
        };
    }

    export(type: ExportType): void {
        const ID: string = this.course.id;
        const body: IEducationExportCourseRq = { type };
        this.apiService.request<IEducationExportCourseRs>('EducationExportCourse', { body, ids: { ID } }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }

    exportInstitute(type: ExportType): void {
        const ID: string = this.course.id;
        const body: IEducationExportCourseInstituteRq = { type };
        this.apiService.request<IEducationExportCourseInstituteRs>(
            'EducationExportCourseInstitute',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }

    exportMentor(type: ExportType): void {
        const ID: string = this.course.id;
        const body: IEducationExportCourseMentorRq = { type };
        this.apiService.request<IEducationExportCourseMentorRs>(
            'EducationExportCourseMentor',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
