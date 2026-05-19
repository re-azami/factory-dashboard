import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryActiveCargoResolver, LaboratoryLoadDataResolver } from './resolvers';

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
        path: 'daily',
        data: {
            menu: 'TEST',
            userAccess: [
                'LABORATORY_CRUSHER',
                'LABORATORY_KHATKA',
                'LABORATORY_BLAINE',
                'LABORATORY_DAVIS',
                'LABORATORY_SOLID',
                'LABORATORY_LOAD',
                'LABORATORY_ROLE_LOAD',
                'LABORATORY_ROLE_TECHNICIAN',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/daily/daily.module').then((m) => m.DailyModule),
    },
    {
        path: 'production',
        data: { menu: 'PRODUCTION', userAccess: ['LABORATORY_PRODUCTION_CRUSHER', 'LABORATORY_PRODUCTION_KHATKA'] },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/production/production.module').then((m) => m.ProductionModule),
    },
    {
        path: 'crusher',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_TECHNICIAN' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/crusher/crusher.module').then((m) => m.CrusherModule),
    },
    {
        path: 'khatka',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_TECHNICIAN' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/khatka/khatka.module').then((m) => m.KhatkaModule),
    },
    {
        path: 'blaine',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_TECHNICIAN' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/blaine/blaine.module').then((m) => m.BlaineModule),
    },
    {
        path: 'davis',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_TECHNICIAN' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/davis/davis.module').then((m) => m.DavisModule),
    },
    {
        path: 'solid',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_TECHNICIAN' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { cargos: LaboratoryActiveCargoResolver },
        loadChildren: () => import('./modules/solid/solid.module').then((m) => m.SolidModule),
    },
    {
        path: 'load',
        data: { menu: 'TEST', userAccess: 'LABORATORY_ROLE_LOAD' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { data: LaboratoryLoadDataResolver },
        loadChildren: () => import('./modules/load/load.module').then((m) => m.LoadModule),
    },
    {
        path: 'misc',
        data: { menu: 'TEST', userAccess: ['LABORATORY_MISC', 'LABORATORY_ROLE_MISC'] },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/misc/misc.module').then((m) => m.MiscModule),
    },
    {
        path: 'supplementary',
        data: { menu: 'TEST', userAccess: ['LABORATORY_SUPPLEMENTARY', 'LABORATORY_ROLE_SUPPLEMENTARY'] },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/supplementary/supplementary.module').then((m) => m.SupplementaryModule),
    },
    {
        path: 'report',
        data: {
            menu: 'REPORT',
            userAccess: [
                'LABORATORY_REPORT_AVERAGE',
                'LABORATORY_REPORT_CRUSHER',
                'LABORATORY_REPORT_KHATKA',
                'LABORATORY_REPORT_LOAD',
                'LABORATORY_ROLE_TECHNICIAN',
                'LABORATORY_ROLE_LOAD',
            ],
        },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/report/report.module').then((m) => m.ReportModule),
    },
    {
        path: 'cargo',
        data: { menu: 'TOOLS', userAccess: 'LABORATORY_CARGO' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/cargo/cargo.module').then((m) => m.CargoModule),
    },
    {
        path: 'setting',
        data: { menu: 'TOOLS', userAccess: 'LABORATORY_SETTING' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/setting/setting.module').then((m) => m.SettingModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
