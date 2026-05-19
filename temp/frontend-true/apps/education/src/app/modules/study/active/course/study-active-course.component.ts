import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationStudyCourseRq,
    IEducationStudyCourseRs,
    IEducationStudyDataRs,
    IEducationStudyDTO,
} from '@lib/apis';
import { EducationStudy, EducationStudyInfo, EducationStudyList } from '@lib/shared';

@Component({
    selector: 'study-active-course',
    templateUrl: './study-active-course.component.html',
    styleUrl: './study-active-course.component.scss',
    standalone: false
})
export class StudyActiveCourseComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    @Output() updated: EventEmitter<IEducationStudyDTO> = new EventEmitter<IEducationStudyDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public data: IEducationStudyDataRs = this.activatedRoute.snapshot.data['data'];

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر دوره',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            {
                                type: 'COMMENT',
                                title: 'دوره فعلی',
                                value: this.study.course.title,
                                description: 'تغییر دوره باعت ایجاد تغییر در کد شناسایی برگزاری دوره می‌شود.',
                            },
                            { type: 'COMMENT', title: 'کد شناسایی', value: this.study.code, english: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'type',
                                type: 'SELECT',
                                title: 'نوع',
                                value: this.study.course.type,
                                options: EducationStudyList.map((study: EducationStudy) => ({
                                    id: study,
                                    title: EducationStudyInfo[study].title,
                                })),
                            },
                            {
                                name: 'course',
                                type: 'SELECT',
                                title: 'دوره جدید',
                                options: this.data.courses.filter((c) => c.id !== this.study.course.id),
                            },
                        ],
                    },
                ],
            },
            { columns: [{ name: 'description', type: 'TEXTAREA', title: 'توضیحات' }] },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.study.id;
        const body: IEducationStudyCourseRq = {
            type: values['type'],
            course: values['course'],
            description: values['description'],
        };
        this.apiService.request<IEducationStudyCourseRs>('EducationStudyCourse', { body, ids: { ID } }, (response) => {
            this.updated.emit(response);
            this.ngxHelperToastService.success('تغییر دوره با موفقیت ثبت شد.');
        });
    }
}
