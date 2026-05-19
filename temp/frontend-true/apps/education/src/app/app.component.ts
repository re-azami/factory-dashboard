import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo } from '@lib/shared';

import { SettingComponent } from './components';
import { EducationToolsService } from './providers';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
    public menu: IPageMenu[] = [
        {
            id: 'DASHBOARD',
            icon: 'home',
            title: 'داشبورد',
            children: [{ title: 'داشبورد', action: ['/dashboard'] }],
        },

        {
            id: 'STUDY',
            icon: 'school',
            title: 'دوره',
            children: [
                { title: 'ثبت دوره جدید', action: ['/study', 'create'], access: { access: 'EDUCATION_ROLE_STUDY' } },
                'DIVIDER',
                {
                    title: 'دوره‌های در حال برگزاری',
                    action: ['/study', 'active'],
                    access: { access: ['EDUCATION_ACTIVE', 'EDUCATION_ROLE_STUDY'] },
                },
                { title: 'تقویم فضای آموزشی', action: ['/study', 'calendar'], access: { access: 'EDUCATION_ROLE_STUDY' } },
                'DIVIDER',
                { title: 'دوره‌های برگزار شده', action: ['/study', 'done'], access: { access: 'EDUCATION_DONE' } },
                { title: 'دوره‌های لغو شده', action: ['/study', 'canceled'], access: { access: 'EDUCATION_CANCELED' } },
                {
                    title: 'دوره‌های پرداخت نشده',
                    action: ['/study', 'unpaid'],
                    access: { access: ['EDUCATION_UNPAID', 'EDUCATION_ROLE_PAYMENT'] },
                },
            ],
        },
        {
            id: 'REPORT',
            icon: 'assessment',
            title: 'گزارش',
            children: [
                {
                    title: 'گزارش دوره‌های برگزار شده',
                    action: ['/report', 'study'],
                    access: { access: 'EDUCATION_REPORT_STUDY' },
                },
                'DIVIDER',
                {
                    title: 'گزارش دوره‌ها',
                    action: this.reportCourse.bind(this),
                    access: { access: 'EDUCATION_REPORT_COURSE' },
                },
                {
                    title: 'گزارش موسسه‌ها',
                    action: this.reportInstitute.bind(this),
                    access: { access: 'EDUCATION_REPORT_INSTITUTE' },
                },
                {
                    title: 'گزارش مدرس‌ها',
                    action: this.reportMentor.bind(this),
                    access: { access: 'EDUCATION_REPORT_MENTOR' },
                },
                {
                    title: 'گزارش شرکت‌کننده‌ها',
                    action: this.reportParticipant.bind(this),
                    access: { access: 'EDUCATION_REPORT_PARTICIPANT' },
                },
                'DIVIDER',
                {
                    title: 'گزارش دوره‌ای امتیاز پرسنل',
                    action: ['/report', 'personnel'],
                    access: { access: 'EDUCATION_REPORT_PERSONNEL' },
                },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                { title: 'مدیریت دوره‌ها', action: ['/course'], access: { access: 'EDUCATION_COURSE' } },
                'DIVIDER',
                { title: 'مدیریت فضاهای آموزشی', action: ['/location'], access: { access: 'EDUCATION_LOCATION' } },
                { title: 'مدیریت موسسه‌ها', action: ['/institute'], access: { access: 'EDUCATION_INSTITUTE' } },
                { title: 'مدیریت مدرس‌ها', action: ['/mentor'], access: { access: 'EDUCATION_MENTOR' } },
                'DIVIDER',
                {
                    title: 'تنظیمات سیستم',
                    action: () => this.ngxHelperBottomSheetService.open(SettingComponent, 'تنظیمات'),
                    access: { access: 'EDUCATION_SETTING' },
                },
            ],
        },
    ];

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly educationToolsService: EducationToolsService,
    ) {}

    ngOnInit(): void {
        this.user = this.userService.user;
        this.onUserChanged = this.userService.onUserChanged.subscribe({
            next: (user?: IUserDTO) => {
                this.user = user;
                this.checkUserAccess();
            },
        });

        setTimeout(this.checkUserAccess.bind(this), 0);
        this.notificationService.subscribe('EDUCATION');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'EDUCATION' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['EDUCATION'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }

    reportCourse(): void {
        this.educationToolsService.selectCourse((counrse) => this.router.navigate(['/report', 'course', counrse.id]));
    }

    reportInstitute(): void {
        this.educationToolsService.selectInstitute((counrse) => this.router.navigate(['/report', 'institute', counrse.id]));
    }

    reportMentor(): void {
        this.educationToolsService.selectMentor((mentor) => this.router.navigate(['/report', 'mentor', mentor.id]));
    }

    reportParticipant(): void {
        this.educationToolsService.selectParticipant((participant) =>
            this.router.navigate(['/report', 'participant', participant.id]),
        );
    }
}
