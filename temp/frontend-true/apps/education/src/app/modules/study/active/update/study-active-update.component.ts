import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationStudyDataRs,
    IEducationStudyDateDTO,
    IEducationStudyDTO,
    IEducationStudyUpdateRq,
    IEducationStudyUpdateRs,
} from '@lib/apis';
import { EducationExam, EducationExamInfo, EducationExamList } from '@lib/shared';

@Component({
    selector: 'study-active-update',
    templateUrl: './study-active-update.component.html',
    styleUrl: './study-active-update.component.scss',
    standalone: false
})
export class StudyActiveUpdateComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    @Output() updated: EventEmitter<IEducationStudyDTO> = new EventEmitter<IEducationStudyDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public data: IEducationStudyDataRs = this.activatedRoute.snapshot.data['data'];

    public dates: IEducationStudyDateDTO[] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش برگزاری دوره',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.dates = [...this.study.dates];

        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            { type: 'COMMENT', title: 'دوره', value: this.study.course.title },
                            { type: 'COMMENT', title: 'کد شناسایی', value: this.study.code, english: true },
                            {
                                name: 'exam',
                                type: 'MULTI-SELECT',
                                title: 'نحوه آزمون',
                                value: this.study.exam,
                                options: EducationExamList.map((exam: EducationExam) => ({
                                    id: exam,
                                    title: EducationExamInfo[exam].title,
                                })),
                                view: 'SELECT',
                            },
                            {
                                name: 'certificate',
                                type: 'CHECKBOX',
                                message: 'گواهینامه دارد',
                                value: this.study.certificate,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'applicant',
                                type: 'SELECT',
                                title: 'واحد درخواست دهنده',
                                value: this.study.applicant?.id,
                                options: this.data.departments,
                                optional: true,
                            },
                            {
                                name: 'department',
                                type: 'MULTI-SELECT',
                                title: 'واحدهای مرتبط',
                                value: this.study.department.map((d) => d.id),
                                options: this.data.departments,
                                description:
                                    'در صورت انتخاب مقدار برای این گزینه، فقط پرسنل مربوط به واحد‌های مشخص شده امکان شرکت در این دوره را خواهند داشت.',
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        value: this.study.description,
                        optional: true,
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.dates.length === 0) {
            this.ngxHelperToastService.error('تاریخ‌های برگزاری مشخص نشده‌اند.');
            return;
        }

        const ID: string = this.study.id;
        const body: IEducationStudyUpdateRq = {
            applicant: values['applicant'],
            department: values['department'],
            exam: values['exam'],
            certificate: values['certificate'],
            description: values['description'],
            dates: this.dates.map((date: IEducationStudyDateDTO) => ({
                date: date.date,
                start: date.start,
                end: date.end,
                type: date.type,
                location: date.location?.id || null,
            })),
        };
        this.apiService.request<IEducationStudyUpdateRs>('EducationStudyUpdate', { body, ids: { ID } }, (response) => {
            this.updated.emit(response);
            this.ngxHelperToastService.success('برگزاری دوره با موفقیت ویرایش شد.');
        });
    }
}
