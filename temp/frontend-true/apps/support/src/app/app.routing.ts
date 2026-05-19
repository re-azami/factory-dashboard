import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

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
        path: 'ticket',
        data: { menu: 'TICKET', userAccess: 'SUPPORT_TICKET' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/ticket/ticket.module').then((m) => m.TicketModule),
    },
    {
        path: 'notification',
        data: { menu: 'NOTIFICATION', userAccess: 'SUPPORT_NOTIFICATION' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/notification/notification.module').then((m) => m.NotificationModule),
    },
    {
        path: 'alert',
        data: { menu: 'NOTIFICATION', userAccess: 'SUPPORT_ALERT' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/alert/alert.module').then((m) => m.AlertModule),
    },

    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
