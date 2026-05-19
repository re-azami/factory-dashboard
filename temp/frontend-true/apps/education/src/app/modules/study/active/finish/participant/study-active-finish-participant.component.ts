import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationFinishParticipantRq,
    IEducationFinishParticipantRs,
    IEducationParticipantDTO,
    IEducationStudyDTO,
} from '@lib/apis';
import { EducationPerformance, EducationPerformanceList } from '@lib/shared';

@Component({
    host: { selector: 'study-active-finish-participant' },
    templateUrl: './study-active-finish-participant.component.html',
    styleUrl: './study-active-finish-participant.component.scss',
    standalone: false
})
export class StudyActiveFinishParticipantComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت نتیجه شرکت در دوره',
        inputs: [
            [
                { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
                { type: 'COMMENT', title: 'شرکت‌کننده', value: this.data.participant.name },
            ],
            [
                {
                    name: 'presence',
                    type: 'NUMBER',
                    title: 'درصد حضور',
                    value: this.data.participant.presence,
                    minimum: 0,
                    maximum: 100,
                    decimal: true,
                    autoFocus: true,
                },
                {
                    name: 'performance',
                    type: 'SELECT',
                    title: 'عملکرد کلاسی',
                    value: this.data.participant.performance,
                    options: EducationPerformanceList.map((p: EducationPerformance) => ({
                        id: p,
                        title: p.split('').reverse().join(''),
                    })),
                    optional: true,
                },
            ],
            {
                name: 'practical',
                type: 'NUMBER',
                title: 'نمره آزمون عملی',
                value: this.data.participant.score.practical,
                minimum: 0,
                maximum: 20,
                decimal: true,
                optional: true,
                hideOn: () => !this.data.study.exam.includes('PRACTICAL'),
            },
            {
                name: 'written',
                type: 'NUMBER',
                title: 'نمره آزمون کتبی',
                value: this.data.participant.score.written,
                minimum: 0,
                maximum: 20,
                decimal: true,
                optional: true,
                hideOn: () => !this.data.study.exam.includes('WRITTEN'),
            },
            {
                name: 'oral',
                type: 'NUMBER',
                title: 'نمره آزمون شفاهی',
                value: this.data.participant.score.oral,
                minimum: 0,
                maximum: 20,
                decimal: true,
                optional: true,
                hideOn: () => !this.data.study.exam.includes('ORAL'),
            },
            {
                name: 'electronic',
                type: 'NUMBER',
                title: 'نمره آزمون الکترونیکی',
                value: this.data.participant.score.electronic,
                minimum: 0,
                maximum: 20,
                decimal: true,
                optional: true,
                hideOn: () => !this.data.study.exam.includes('ELECTRONIC'),
            },
            {
                name: 'certificate',
                type: 'CHECKBOX',
                message: 'شرکت‌کننده گواهینامه دوره را دریافت کرده است',
                value: this.data.participant.presence ? this.data.participant.certificate : true,
                hideOn: () => !this.data.study.certificate,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { study: IEducationStudyDTO; participant: IEducationParticipantDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const STUDYID: string = this.data.study.id;
        const body: IEducationFinishParticipantRq = {
            participant: this.data.participant.id,
            presence: values['presence'],
            performance: values['performance'],
            score: {
                practical: values['practical'],
                written: values['written'],
                oral: values['oral'],
                electronic: values['electronic'],
            },
            certificate: values['certificate'] || false,
        };
        this.apiService.request<IEducationFinishParticipantRs>(
            'EducationFinishParticipant',
            { body, ids: { STUDYID } },
            () => this.ngxHelperBottomSheetService.close(true),
        );
    }
}
