import { Component, Input, OnInit } from '@angular/core';

import { IEducationStudyDTO } from '@lib/apis';
import { IPageCardButton } from '@lib/page';
import {
    EducationDate,
    EducationDateInfo,
    EducationDateList,
    EducationEducatorInfo,
    EducationExamInfo,
    EducationStudyInfo,
} from '@lib/shared';

@Component({
    selector: 'study-view-info',
    templateUrl: './study-view-info.component.html',
    styleUrl: './study-view-info.component.scss',
    standalone: false
})
export class StudyViewInfoComponent implements OnInit {
    @Input({ required: true }) study!: IEducationStudyDTO;
    @Input({ required: false }) buttons: IPageCardButton[] = [];

    public educationStudyInfo = EducationStudyInfo;
    public educationEducatorinfo = EducationEducatorInfo;
    public educationExamInfo = EducationExamInfo;

    public educationDateList = EducationDateList;
    public educationDateInfo = EducationDateInfo;

    public durations: { [key in EducationDate]: number } = { PRACTICAL: 0, THEORETICAL: 0 };

    ngOnInit(): void {
        this.durations = { PRACTICAL: 0, THEORETICAL: 0 };
        this.study.dates.forEach((d) => (this.durations[d.type] += d.duration));
    }
}
