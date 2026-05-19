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
        path: 'flow',
        data: { menu: 'FLOW' },
        canActivate: [UserGuard],
        loadChildren: () => import('./modules/flow/flow.module').then((m) => m.FlowModule),
    },
    {
        path: 'draft',
        data: {
            menu: 'DRAFT',
            userAccess: [
                'LOAD_DRAFT_DAILY',
                'LOAD_DRAFT_ACTIVE',
                'LOAD_DRAFT_FINISHED',
                'LOAD_DRAFT_CANCELED',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/draft/draft.module').then((m) => m.DraftModule),
    },
    {
        path: 'report',
        data: {
            menu: 'REPORT',
            userAccess: [
                'LOAD_REPORT_ACTIVE',
                'LOAD_REPORT_DRAFT',
                'LOAD_REPORT_DAILY',
                'LOAD_REPORT_PARTY',
                'LOAD_REPORT_SHIPMENT',
                'LOAD_REPORT_TRANSPORTER',
                'LOAD_REPORT_CARGO',
                'LOAD_REPORT_OWNER',
                'LOAD_REPORT_TRUCK',
                'LOAD_REPORT_DAILY_TRANSPORTER',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/report/report.module').then((m) => m.ReportModule),
    },
    {
        path: 'cargo',
        data: { menu: 'TOOLS', userAccess: 'LOAD_CARGO' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/cargo/cargo.module').then((m) => m.CargoModule),
    },
    {
        path: 'party',
        data: { menu: 'TOOLS', userAccess: 'LOAD_PARTY' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/party/party.module').then((m) => m.PartyModule),
    },
    {
        path: 'shipment',
        data: { menu: 'TOOLS', userAccess: 'LOAD_SHIPMENT' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/shipment/shipment.module').then((m) => m.ShipmentModule),
    },
    {
        path: 'misc',
        data: { menu: 'TOOLS', userAccess: 'LOAD_MISC' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/misc/misc.module').then((m) => m.MiscModule),
    },
    {
        path: 'transporter',
        data: { menu: 'TOOLS', userAccess: 'LOAD_TRANSPORTER' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/transporter/transporter.module').then((m) => m.TransporterModule),
    },
    {
        path: 'owner',
        data: { menu: 'TOOLS', userAccess: 'LOAD_OWNER' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/owner/owner.module').then((m) => m.OwnerModule),
    },
    {
        path: 'truck',
        data: { menu: 'TOOLS', userAccess: 'LOAD_TRUCK' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/truck/truck.module').then((m) => m.TruckModule),
    },
    {
        path: 'checkout',
        data: { menu: 'TOOLS', userAccess: 'LOAD_CHECKOUT' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/checkout/checkout.module').then((m) => m.CheckoutModule),
    },
    {
        path: 'setting',
        data: { menu: 'TOOLS', userAccess: 'LOAD_SETTING' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/setting/setting.module').then((m) => m.SettingModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
