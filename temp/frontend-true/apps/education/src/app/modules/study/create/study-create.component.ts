import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationStudyCreateRq,
    IEducationStudyCreateRs,
    IEducationStudyDataRs,
    IEducationStudyDateDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';
import {
    EducationEducator,
    EducationEducatorInfo,
    EducationEducatorList,
    EducationExam,
    EducationExamInfo,
    EducationExamList,
    EducationStudy,
    EducationStudyInfo,
    EducationStudyList,
} from '@lib/shared';

@Component({
    host: { selector: 'study-create' },
    templateUrl: './study-create.component.html',
    styleUrl: './study-create.component.scss',
    standalone: false
})
export class StudyCreateComponent {
    public data: IEducationStudyDataRs = this.activatedRoute.snapshot.data['data'];

    public title: IPageTitle = { title: 'ثبت برگزاری دوره جدید' };

    public dates: IEducationStudyDateDTO[] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت برگزاری دوره جدید',
        sections: [
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'type',
                                type: 'SELECT',
                                title: 'نوع',
                                options: EducationStudyList.map((study: EducationStudy) => ({
                                    id: study,
                                    title: EducationStudyInfo[study].title,
                                })),
                            },
                            { name: 'course', type: 'SELECT', title: 'دوره', options: this.data.courses },
                            {
                                name: 'educator',
                                type: 'SELECT',
                                title: 'برگزار کننده',
                                options: EducationEducatorList.map((educator: EducationEducator) => ({
                                    id: educator,
                                    title: EducationEducatorInfo[educator].title,
                                })),
                            },
                            {
                                name: 'institute-id',
                                type: 'SELECT',
                                title: 'موسسه',
                                options: this.data.institutes,
                                hideOn: (values) => values['educator'] !== 'INSTITUTE',
                            },
                            {
                                name: 'mentor-id',
                                type: 'SELECT',
                                title: 'مدرس',
                                options: this.data.mentors,
                                hideOn: (values) => values['educator'] !== 'MENTOR',
                            },
                            {
                                name: 'personnel-id',
                                type: 'SELECT',
                                title: 'پرسنل',
                                options: this.data.personnels.map((p) => ({
                                    id: p.id,
                                    title: `${p.name.first} ${p.name.last}`,
                                })),
                                hideOn: (values) => values['educator'] !== 'PERSONNEL',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'applicant',
                                type: 'SELECT',
                                title: 'واحد درخواست دهنده',
                                options: this.data.departments,
                                optional: true,
                            },
                            {
                                name: 'department',
                                type: 'MULTI-SELECT',
                                title: 'واحدهای مرتبط',
                                options: this.data.departments,
                                description:
                                    'در صورت انتخاب مقدار برای این گزینه، فقط پرسنل مربوط به واحد‌های مشخص شده امکان شرکت در این دوره را خواهند داشت.',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'expense',
                                type: 'PRICE',
                                title: 'هزینه برگزاری',
                                currency: 'تومان',
                                showText: true,
                                description:
                                    'این گزینه فقط شامل هزینه‌ای است که به برگزار کننده داده می‌شود، سایر هزینه‌های مربوط به دوره پس از ثبت اطلاعات مشخص می‌شود.',
                            },
                            {
                                name: 'participant',
                                type: 'NUMBER',
                                title: 'حداکثر تعداد شرکت‌کننده',
                                minimum: 1,
                                description: 'امکان افزایش تعداد در بخش مدیریت شرکت‌کننده‌ها وجود دارد.',
                            },
                            {
                                name: 'exam',
                                type: 'MULTI-SELECT',
                                title: 'نحوه آزمون',
                                options: EducationExamList.map((exam: EducationExam) => ({
                                    id: exam,
                                    title: EducationExamInfo[exam].title,
                                })),
                                view: 'SELECT',
                            },
                            { name: 'certificate', type: 'CHECKBOX', message: 'گواهینامه دارد' },
                        ],
                    },
                ],
            },
            { columns: [{ name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true }] },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/study']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        if (this.dates.length === 0) {
            this.ngxHelperToastService.error('تاریخ‌های برگزاری مشخص نشده‌اند.');
            return;
        }

        const body: IEducationStudyCreateRq = {
            type: values['type'],
            course: values['course'],
            applicant: values['applicant'],
            department: values['department'],
            educator: values['educator'],
            educatorId: values[(values['educator'] as string).toLowerCase() + '-id'],
            expense: values['expense'],
            participant: values['participant'],
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
        this.apiService.request<IEducationStudyCreateRs>('EducationStudyCreate', { body }, (response) => {
            this.router.navigate(['/study', 'active', response.id]);
            this.ngxHelperToastService.success('برگزاری دوره با موفقیت ثبت شد.');
        });
    }
}
