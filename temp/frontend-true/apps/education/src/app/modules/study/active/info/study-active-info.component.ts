import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IEducationStudyDeleteRs, IEducationStudyDTO } from '@lib/apis';
import { IPageCardButton, IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { EducationStudyService } from '../../../../providers';

import { StudyActiveCancelComponent } from '../cancel/study-active-cancel.component';

@Component({
    host: { selector: 'study-active-info' },
    templateUrl: './study-active-info.component.html',
    styleUrl: './study-active-info.component.scss',
    standalone: false
})
export class StudyActiveInfoComponent implements OnInit {
    public study: IEducationStudyDTO = this.activatedRoute.snapshot.data['study'];

    public title: IPageTitle = { title: 'دوره‌های در حال برگزاری', actions: [] };
    public buttons: IPageCardButton[] = [
        { title: 'لغو دوره', icon: 'cancel', action: this.cancel.bind(this), color: 'warn' },
        { title: 'حذف دوره', icon: 'delete', action: this.delete.bind(this), color: 'warn' },
    ];

    public activeTab: number = 0;

    public studyAccess: boolean = this.userService.hasAccess({ access: 'EDUCATION_ROLE_STUDY' });

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly educationStudyService: EducationStudyService,
    ) {}

    ngOnInit(): void {
        const study: IEducationStudyDTO = this.activatedRoute.snapshot.data['study'];
        this.setStudy(study);
    }

    setStudy(study: IEducationStudyDTO): void {
        this.study = study;

        this.title = {
            ...this.title,
            actions: [
                {
                    type: 'MENU',
                    title: 'دانلود لیست حضور و غیاب',
                    icon: 'download',
                    action: this.exportStudy.bind(this),
                    menu: ExportTypeList.map((type: ExportType) => ({ id: type, title: ExportTypeInfo[type].title })),
                    access: { access: 'EDUCATION_ROLE_STUDY' },
                    hideOn: () => this.study.participant.count === 0,
                },
                {
                    title: 'گزارش تغییرات',
                    icon: 'published_with_changes',
                    action: () => this.educationStudyService.showLog(this.study),
                    access: { access: 'EDUCATION_LOG' },
                },
                { type: 'RETURN', action: ['/study', 'active'] },
            ],
        };
    }

    exportStudy(id: string): void {
        const type: ExportType = id as ExportType;
        if (!ExportTypeList.includes(type) || this.study.participant.count === 0) return;

        this.educationStudyService.exportStudy(this.study, type);
    }

    cancel(): void {
        this.ngxHelperBottomSheetService.open(StudyActiveCancelComponent, 'لغو برگزاری دوره', {
            data: { study: this.study },
        });
    }

    delete(): void {
        const item: string = 'برگزاری دوره';
        const title: string = this.study.course.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';
        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = this.study.id;
            this.apiService.request<IEducationStudyDeleteRs>('EducationStudyDelete', { ids: { ID } }, () => {
                this.router.navigate(['/study', 'active']);
                this.ngxHelperToastService.success('برگزاری دوره با موفقیت حذف شد.');
            });
        });
    }
}
