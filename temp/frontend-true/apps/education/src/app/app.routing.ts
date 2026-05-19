import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

import { EducationDataResolver } from './resolvers';

const routes: Routes = [
    { path: '', canActivate: [VisitorGuard], component: PageUserSigninComponent },
    { path: 'retrieval', canActivate: [VisitorGuard], component: PageUserRetrievalComponent },
    {
        path: 'dashboard',
        data: { menu: 'DASHBOARD' },
        canActivate: [UserGuard],
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    },

    {
        path: 'mentor',
        data: { menu: 'TOOLS', userAccess: 'EDUCATION_MENTOR' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/mentor/mentor.module').then((m) => m.MentorModule),
    },
    {
        path: 'institute',
        data: { menu: 'TOOLS', userAccess: 'EDUCATION_INSTITUTE' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/institute/institute.module').then((m) => m.InstituteModule),
    },
    {
        path: 'location',
        data: { menu: 'TOOLS', userAccess: 'EDUCATION_LOCATION' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/location/location.module').then((m) => m.LocationModule),
    },
    {
        path: 'course',
        data: { menu: 'TOOLS', userAccess: 'EDUCATION_COURSE' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/course/course.module').then((m) => m.CourseModule),
    },
    {
        path: 'study',
        data: {
            menu: 'STUDY',
            userAccess: [
                'EDUCATION_ACTIVE',
                'EDUCATION_DONE',
                'EDUCATION_CANCELED',
                'EDUCATION_UNPAID',
                'EDUCATION_ROLE_STUDY',
                'EDUCATION_ROLE_PAYMENT',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { data: EducationDataResolver },
        loadChildren: () => import('./modules/study/study.module').then((m) => m.StudyModule),
    },
    {
        path: 'report',
        data: {
            menu: 'REPORT',
            userAccess: [
                'EDUCATION_REPORT_STUDY',
                'EDUCATION_REPORT_COURSE',
                'EDUCATION_REPORT_INSTITUTE',
                'EDUCATION_REPORT_MENTOR',
                'EDUCATION_REPORT_PARTICIPANT',
                'EDUCATION_REPORT_PERSONNEL',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/report/report.module').then((m) => m.ReportModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
