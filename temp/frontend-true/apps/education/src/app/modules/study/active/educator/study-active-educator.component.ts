import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationStudyDataRs,
    IEducationStudyDTO,
    IEducationStudyEducatorRq,
    IEducationStudyEducatorRs,
} from '@lib/apis';
import { EducationEducator, EducationEducatorInfo, EducationEducatorList } from '@lib/shared';

@Component({
    selector: 'study-active-educator',
    templateUrl: './study-active-educator.component.html',
    styleUrl: './study-active-educator.component.scss',
    standalone: false
})
export class StudyActiveEducatorComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;

    @Output() updated: EventEmitter<IEducationStudyDTO> = new EventEmitter<IEducationStudyDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public data: IEducationStudyDataRs = this.activatedRoute.snapshot.data['data'];

    public ngxForm: INgxResponsiveForm = {
        submit: 'تغییر برگزار کننده',
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
                            { type: 'COMMENT', title: 'دوره', value: this.study.course.title },
                            { type: 'COMMENT', title: 'کد شناسایی', value: this.study.code, english: true },
                            {
                                type: 'COMMENT',
                                title: 'برگزار کننده فعلی',
                                value: this.study.educator.title,
                                description: EducationEducatorInfo[this.study.educator.type].title,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'educator',
                                type: 'SELECT',
                                title: 'برگزار کننده جدید',
                                options: EducationEducatorList.map((educator: EducationEducator) => ({
                                    id: educator,
                                    title: EducationEducatorInfo[educator].title,
                                })),
                            },
                            {
                                name: 'institute-id',
                                type: 'SELECT',
                                title: 'موسسه',
                                options: this.data.institutes.filter((i) => i.id !== this.study.educator.id),
                                hideOn: (values) => values['educator'] !== 'INSTITUTE',
                            },
                            {
                                name: 'mentor-id',
                                type: 'SELECT',
                                title: 'مدرس',
                                options: this.data.mentors.filter((m) => m.id !== this.study.educator.id),
                                hideOn: (values) => values['educator'] !== 'MENTOR',
                            },
                            {
                                name: 'personnel-id',
                                type: 'SELECT',
                                title: 'پرسنل',
                                options: this.data.personnels
                                    .filter((p) => p.id !== this.study.educator.id)
                                    .map((p) => ({
                                        id: p.id,
                                        title: `${p.name.first} ${p.name.last}`,
                                    })),
                                hideOn: (values) => values['educator'] !== 'PERSONNEL',
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
        const body: IEducationStudyEducatorRq = {
            educator: values['educator'],
            educatorId: values[(values['educator'] as string).toLowerCase() + '-id'],
            description: values['description'],
        };
        this.apiService.request<IEducationStudyEducatorRs>('EducationStudyEducator', { body, ids: { ID } }, (response) => {
            this.updated.emit(response);
            this.ngxHelperToastService.success('تغییر برگزار کننده با موفقیت ثبت شد.');
        });
    }
}
