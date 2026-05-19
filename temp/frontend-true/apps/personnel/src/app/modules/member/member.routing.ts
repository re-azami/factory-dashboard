import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { PersonnelMemberResolver } from '../../resolvers';

import { MemberComponent } from './member.component';
import { MemberCreateComponent } from './create/member-create.component';
import { MemberInfoComponent } from './info/member-info.component';

const routes: Routes = [
    { path: '', component: MemberComponent },
    {
        path: 'create',
        data: { userAccess: ['PERSONNEL_MEMBER', 'PERSONNEL_ROLE_MEMBER'] },
        canActivate: [UserAccessGuard],
        component: MemberCreateComponent,
    },
    {
        path: 'info/:ID',
        data: { userAccess: ['PERSONNEL_SEARCH', 'PERSONNEL_MEMBER', 'PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'] },
        canActivate: [UserAccessGuard],
        resolve: { member: PersonnelMemberResolver },
        component: MemberInfoComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class MemberRoutingModule {}
