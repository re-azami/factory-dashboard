import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { EducationCoursesResolver, EducationStudyResolver } from '../../resolvers';

import { StudyCreateComponent } from './create/study-create.component';
import { StudyCalendarComponent } from './calendar/study-calendar.component';
import { StudyActiveComponent } from './active/study-active.component';
import { StudyActiveInfoComponent } from './active/info/study-active-info.component';
import { StudyListComponent } from './list/study-list.component';
import { StudyListInfoComponent } from './list/info/study-list-info.component';
import { StudyUnpaidComponent } from './unpaid/study-unpaid.component';

const routes: Routes = [
    {
        path: 'create',
        data: { userAccess: 'EDUCATION_ROLE_STUDY' },
        canActivate: [UserAccessGuard],
        component: StudyCreateComponent,
    },
    {
        path: 'calendar',
        data: { userAccess: 'EDUCATION_ROLE_STUDY' },
        canActivate: [UserAccessGuard],
        component: StudyCalendarComponent,
    },
    {
        path: 'active',
        data: { userAccess: ['EDUCATION_ACTIVE', 'EDUCATION_ROLE_STUDY'] },
        canActivate: [UserAccessGuard],
        component: StudyActiveComponent,
    },
    {
        path: 'active/:ID',
        data: { userAccess: ['EDUCATION_ACTIVE', 'EDUCATION_ROLE_STUDY'] },
        canActivate: [UserAccessGuard],
        resolve: { study: EducationStudyResolver },
        component: StudyActiveInfoComponent,
    },

    {
        path: 'done',
        data: { type: 'DONE', userAccess: 'EDUCATION_DONE' },
        canActivate: [UserAccessGuard],
        resolve: { courses: EducationCoursesResolver },
        component: StudyListComponent,
    },
    {
        path: 'done/:ID',
        data: { type: 'DONE', userAccess: 'EDUCATION_DONE' },
        canActivate: [UserAccessGuard],
        resolve: { study: EducationStudyResolver },
        component: StudyListInfoComponent,
    },
    {
        path: 'canceled',
        data: { type: 'CANCELED', userAccess: 'EDUCATION_CANCELED' },
        canActivate: [UserAccessGuard],
        resolve: { courses: EducationCoursesResolver },
        component: StudyListComponent,
    },
    {
        path: 'canceled/:ID',
        data: { type: 'CANCELED', userAccess: 'EDUCATION_CANCELED' },
        canActivate: [UserAccessGuard],
        resolve: { study: EducationStudyResolver },
        component: StudyListInfoComponent,
    },
    {
        path: 'unpaid',
        data: { userAccess: ['EDUCATION_UNPAID', 'EDUCATION_ROLE_PAYMENT'] },
        canActivate: [UserAccessGuard],
        resolve: { courses: EducationCoursesResolver },
        component: StudyUnpaidComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class StudyRoutingModule {}
