import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { ReportMemberComponent } from './member/report-member.component';

const routes: Routes = [
    {
        path: 'member',
        data: { userAccess: ['PERSONNEL_REPORT_MEMBER', 'PERSONNEL_ROLE_MEMBER'] },
        canActivate: [UserAccessGuard],
        component: ReportMemberComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ReportRoutingModule {}
