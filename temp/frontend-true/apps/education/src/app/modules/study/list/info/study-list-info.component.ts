import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IEducationStudyDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';

import { EducationStudyService } from '../../../../providers';

@Component({
    host: { selector: 'study-list-info' },
    templateUrl: './study-list-info.component.html',
    styleUrl: './study-list-info.component.scss',
    standalone: false
})
export class StudyListInfoComponent {
    public type: 'DONE' | 'CANCELED' = this.activatedRoute.snapshot.data['type'];
    public study: IEducationStudyDTO = this.activatedRoute.snapshot.data['study'];

    public title: IPageTitle = {
        title: this.type === 'DONE' ? 'دوره‌های برگزار شده' : 'دوره‌های لغو شده',
        actions: [
            {
                title: 'گزارش تغییرات',
                icon: 'published_with_changes',
                action: () => this.educationStudyService.showLog(this.study),
                access: { access: 'EDUCATION_LOG' },
            },
            { type: 'RETURN', action: ['/study', this.type.toLowerCase()] },
        ],
    };

    public activeTab: number = 0;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly educationStudyService: EducationStudyService,
    ) {}
}
