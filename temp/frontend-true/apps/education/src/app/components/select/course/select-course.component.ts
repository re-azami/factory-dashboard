import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, IEducationCourseFullRs, IOptionDTO } from '@lib/apis';

@Component({
    host: { selector: 'select-course' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './select-course.component.html',
    styleUrl: './select-course.component.scss'
})
export class SelectCourseComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'انتخاب دوره',
        inputs: [],
    };

    public loading: boolean = true;
    public courses: IOptionDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { current?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IEducationCourseFullRs>('EducationCourseFull', (response) => {
            this.loading = false;
            this.courses = response;

            this.ngxForm.inputs = [
                { name: 'course', type: 'SELECT', title: 'دوره', options: response, value: this.data.current },
            ];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const course = this.courses.find((c) => c.id === values['course']);
        if (course) this.ngxHelperBottomSheetService.close(course);
    }
}
