import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IEducationFinishSaveRq, IEducationFinishSaveRs, IEducationStudyDTO } from '@lib/apis';
import { EducationStudyInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-active-finish-save' },
    templateUrl: './study-active-finish-save.component.html',
    styleUrl: './study-active-finish-save.component.scss',
    standalone: false
})
export class StudyActiveFinishSaveComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت نتیجه شرکت در دوره',
        inputs: [
            { type: 'COMMENT', title: 'دوره', value: this.data.study.course.title },
            [
                { type: 'COMMENT', title: 'نوع دوره', value: EducationStudyInfo[this.data.study.course.type].title },
                { type: 'COMMENT', title: 'کد شناسایی', value: this.data.study.code, english: true },
            ],
            { name: 'confirm', type: 'CHECKBOX', message: 'اطلاعات دوره به صورت کامل ثبت و بررسی شده است' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        if (values['confirm'] !== true) {
            this.ngxHelperToastService.error('ثبت و بررسی اطلاعات دوره را تایید کنید.');
            return;
        }

        const STUDYID: string = this.data.study.id;
        const body: IEducationFinishSaveRq = {
            description: values['description'],
        };
        this.apiService.request<IEducationFinishSaveRs>('EducationFinishSave', { body, ids: { STUDYID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
