import { Component, OnInit } from '@angular/core';

import { NgxHelperDurationPipe, NgxHelperPricePipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IEducationStudyDTO, IEducationStudyListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { EducationEducatorInfo, EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active' },
    templateUrl: './study-active.component.html',
    styleUrl: './study-active.component.scss',
    standalone: false
})
export class StudyActiveComponent implements OnInit {
    public title: IPageTitle = { title: 'دوره‌های در حال برگزاری' };

    public loading: boolean = true;
    public studies: IEducationStudyDTO[] = [];

    public list: IList<IEducationStudyDTO> = {
        type: 'دوره',
        description: (data) => data.description,
        columns: [
            {
                title: 'دوره',
                value: (data) => data.course.title,
                description: (data) => ({ en: data.code }),
                action: (data) => ['/study', 'active', data.id],
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

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.request<IEducationStudyListRs>('EducationStudyList', (response) => {
            this.loading = false;
            this.studies = response;
        });
    }
}
