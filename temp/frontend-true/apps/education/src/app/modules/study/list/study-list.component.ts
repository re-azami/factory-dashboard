import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { NgxHelperDurationPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IEducationStudyCanceledRs,
    IEducationStudyDoneRs,
    IEducationStudyDTO,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { EducationEducatorInfo, EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-list' },
    templateUrl: './study-list.component.html',
    styleUrl: './study-list.component.scss',
    standalone: false
})
export class StudyListComponent {
    public type: 'DONE' | 'CANCELED' = this.activatedRoute.snapshot.data['type'];
    public courses: IOptionDTO[] = this.activatedRoute.snapshot.data['courses'];

    public page: number = 1;
    public title: IPageTitle = {
        title: this.type === 'DONE' ? 'دوره‌های برگزار شده' : 'دوره‌های لغو شده',
        toolbar: {
            route: ['/study', this.type.toLowerCase()],
            params: [{ name: 'course', type: 'SELECT', title: 'دوره', options: this.courses }],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public studies: IEducationStudyDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IEducationStudyDTO> = {
        type: 'دوره',
        description: (data) => data.description,
        columns: [
            {
                title: 'دوره',
                value: (data) => data.course.title,
                description: (data) => ({ en: data.code }),
                action: (data) => ['/study', this.type.toLowerCase(), data.id],
            },
            { title: 'نوع دوره', value: (data) => EducationStudyInfo[data.course.type].title },
            { title: 'شرکت کننده', value: (data) => `${data.participant.count} از ${data.participant.maximum}` },
            {
                title: 'برگزار کننده',
                value: (data) => `${data.educator.title} (${EducationEducatorInfo[data.educator.type].title})`,
            },
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
                title: 'هزینه',
                value: (data) => data.expense.total,
                type: 'PRICE',
                description: (data) =>
                    [
                        data.expense.educator ? `برگزاری: ${this.pricePipe(data.expense.educator)}` : '',
                        data.expense.extra ? `سایر: ${this.pricePipe(data.expense.extra)}` : '',
                    ]
                        .filter((d) => !!d)
                        .join(' :: '),
            },
        ],
    };

    private durationPipe = new NgxHelperDurationPipe().transform;
    private pricePipe = new NgxHelperPricePipe().transform;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const course: string = this.params?.params?.['course']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IEducationStudyDoneRs | IEducationStudyCanceledRs>(
            this.type === 'DONE' ? 'EducationStudyDone' : 'EducationStudyCanceled',
            { params: { course, page } },
            (response) => {
                this.loading = false;
                this.studies = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
