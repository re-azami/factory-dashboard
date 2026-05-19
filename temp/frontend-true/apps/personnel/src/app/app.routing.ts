import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

import { PersonnelGroupsResolver } from './resolvers';

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
        path: 'group',
        data: { menu: 'TOOLS', userAccess: ['PERSONNEL_GROUP'] },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/group/group.module').then((m) => m.GroupModule),
    },
    {
        path: 'member',
        data: {
            menu: 'MEMBER',
            userAccess: ['PERSONNEL_SEARCH', 'PERSONNEL_MEMBER', 'PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'],
        },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { groups: PersonnelGroupsResolver },
        loadChildren: () => import('./modules/member/member.module').then((m) => m.MemberModule),
    },
    {
        path: 'location',
        data: { menu: 'LOCATION', userAccess: ['PERSONNEL_LOCATION'] },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/location/location.module').then((m) => m.LocationModule),
    },
    {
        path: 'report',
        data: { menu: 'REPORT' },
        canActivate: [UserGuard],
        loadChildren: () => import('./modules/report/report.module').then((m) => m.ReportModule),
    },
    {
        path: 'export',
        data: { menu: 'EXPORT', userAccess: ['PERSONNEL_EXPORT', 'PERSONNEL_ROLE_MEMBER'] },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { groups: PersonnelGroupsResolver },
        loadChildren: () => import('./modules/export/export.module').then((m) => m.ExportModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
