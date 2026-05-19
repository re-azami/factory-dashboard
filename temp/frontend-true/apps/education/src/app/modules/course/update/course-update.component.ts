import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IEducationCourseDTO, IEducationCourseUpdateRq, IEducationCourseUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'course-update' },
    templateUrl: './course-update.component.html',
    styleUrl: './course-update.component.scss',
    standalone: false
})
export class CourseUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش دوره',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.course.title },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', value: this.data.course.description, optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { course: IEducationCourseDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.course.id;
        const body: IEducationCourseUpdateRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<IEducationCourseUpdateRs>('EducationCourseUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
