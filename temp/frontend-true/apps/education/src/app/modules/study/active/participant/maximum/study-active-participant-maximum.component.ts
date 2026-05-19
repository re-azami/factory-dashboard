import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationStudyDTO, IEducationStudyParticipantRq, IEducationStudyParticipantRs } from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-participant-maximum' },
    templateUrl: './study-active-participant-maximum.component.html',
    styleUrl: './study-active-participant-maximum.component.scss',
    standalone: false
})
export class StudyActiveParticipantMaximumComponent {
    public ngxForm: INgxForm = {
        submit: 'تغییر تعداد شرکت‌کننده',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            {
                name: 'participant',
                type: 'NUMBER',
                title: 'حداکثر تعداد شرکت‌کننده',
                value: this.data.study.participant.maximum,
                minimum: this.data.study.participant.count || 1,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.study.id;
        const body: IEducationStudyParticipantRq = { participant: values['participant'] };
        this.apiService.request<IEducationStudyParticipantRs>(
            'EducationStudyParticipant',
            { body, ids: { ID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
