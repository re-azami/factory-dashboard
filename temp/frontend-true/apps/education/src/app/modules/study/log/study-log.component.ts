import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ApiService, IEducationLogDTO, IEducationStudyDTO, IEducationStudyLogRs } from '@lib/apis';
import { EducationLogInfo } from '@lib/shared';

@Component({
    host: { selector: 'study-log' },
    templateUrl: './study-log.component.html',
    styleUrl: './study-log.component.scss',
    standalone: false
})
export class StudyLogComponent implements OnInit {
    public educationLogInfo = EducationLogInfo;

    public loading: boolean = true;
    public logs: IEducationLogDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { study: IEducationStudyDTO },
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.study.id;
        this.apiService.request<IEducationStudyLogRs>('EducationStudyLog', { ids: { ID } }, (response) => {
            this.loading = false;
            this.logs = response;
        });
    }
}
