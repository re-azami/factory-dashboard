import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { SharedPersonnelInfoResolver } from '@lib/shared';

import { ReportStudyComponent } from './study/report-study.component';
import { ReportCourseComponent } from './course/report-course.component';
import { ReportInstituteComponent } from './institute/report-institute.component';
import { ReportMentorComponent } from './mentor/report-mentor.component';
import { ReportParticipantComponent } from './participant/report-participant.component';
import { ReportPersonnelComponent } from './personnel/report-personnel.component';

const routes: Routes = [
    { path: 'study', data: { userAccess: 'EDUCATION_REPORT_STUDY' }, component: ReportStudyComponent },

    { path: 'course/:ID', data: { userAccess: 'EDUCATION_REPORT_COURSE' }, component: ReportCourseComponent },
    { path: 'institute/:ID', data: { userAccess: 'EDUCATION_REPORT_INSTITUTE' }, component: ReportInstituteComponent },
    { path: 'mentor/:ID', data: { userAccess: 'EDUCATION_REPORT_MENTOR' }, component: ReportMentorComponent },
    {
        path: 'participant/:PARTICIPANTID',
        data: { userAccess: 'EDUCATION_REPORT_PARTICIPANT' },
        resolve: { participant: SharedPersonnelInfoResolver },
        runGuardsAndResolvers: 'paramsChange',
        component: ReportParticipantComponent,
    },
    { path: 'personnel', data: { userAccess: 'EDUCATION_REPORT_PERSONNEL' }, component: ReportPersonnelComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ReportRoutingModule {}
