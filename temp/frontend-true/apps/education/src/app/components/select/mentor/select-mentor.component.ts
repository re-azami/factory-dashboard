import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, IEducationMentorFullRs, IOptionDTO } from '@lib/apis';

@Component({
    host: { selector: 'select-mentor' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './select-mentor.component.html',
    styleUrl: './select-mentor.component.scss'
})
export class SelectMentorComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'انتخاب مدرس',
        inputs: [],
    };

    public loading: boolean = true;
    public mentors: IOptionDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { current?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IEducationMentorFullRs>('EducationMentorFull', (response) => {
            this.loading = false;
            this.mentors = response;

            this.ngxForm.inputs = [
                { name: 'mentor', type: 'SELECT', title: 'مدرس', options: response, value: this.data.current },
            ];
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const mentor = this.mentors.find((m) => m.id === values['mentor']);
        if (mentor) this.ngxHelperBottomSheetService.close(mentor);
    }
}
