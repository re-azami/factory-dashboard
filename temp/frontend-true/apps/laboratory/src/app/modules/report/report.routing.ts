import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { LaboratoryCrusherDataResolver, LaboratoryKhatkaDataResolver, LaboratoryLoadDataResolver } from '../../resolvers';

import { ReportAverageComponent } from './average/report-average.component';
import { ReportCrusherComponent } from './crusher/report-crusher.component';
import { ReportCrusherDataComponent } from './crusher/data/report-crusher-data.component';
import { ReportCrusherLocationComponent } from './crusher/location/report-crusher-location.component';
import { ReportKhatkaComponent } from './khatka/report-khatka.component';
import { ReportKhatkaDataComponent } from './khatka/data/report-khatka-data.component';
import { ReportKhatkaLocationComponent } from './khatka/location/report-khatka-location.component';
import { ReportLoadComponent } from './load/report-load.component';
import { ReportLoadDataComponent } from './load/data/report-load-data.component';

const routes: Routes = [
    {
        path: 'average',
        data: { userAccess: 'LABORATORY_REPORT_AVERAGE' },
        canActivate: [UserAccessGuard],
        component: ReportAverageComponent,
    },
    {
        path: 'crusher',
        data: { userAccess: ['LABORATORY_REPORT_CRUSHER', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        resolve: { data: LaboratoryCrusherDataResolver },
        component: ReportCrusherComponent,
    },
    {
        path: 'crusher/location',
        data: { userAccess: ['LABORATORY_REPORT_CRUSHER_LOCATION', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        component: ReportCrusherLocationComponent,
    },
    {
        path: 'crusher/:ID',
        data: { userAccess: ['LABORATORY_REPORT_CRUSHER', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        component: ReportCrusherDataComponent,
    },
    {
        path: 'khatka',
        data: { userAccess: ['LABORATORY_REPORT_KHATKA', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        resolve: { data: LaboratoryKhatkaDataResolver },
        component: ReportKhatkaComponent,
    },
    {
        path: 'khatka/location',
        data: { userAccess: ['LABORATORY_REPORT_KHATKA_LOCATION', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        component: ReportKhatkaLocationComponent,
    },
    {
        path: 'khatka/:ID',
        data: { userAccess: ['LABORATORY_REPORT_KHATKA', 'LABORATORY_ROLE_TECHNICIAN'] },
        canActivate: [UserAccessGuard],
        component: ReportKhatkaDataComponent,
    },
    {
        path: 'load',
        data: { userAccess: ['LABORATORY_REPORT_LOAD', 'LABORATORY_ROLE_LOAD'] },
        canActivate: [UserAccessGuard],
        resolve: { data: LaboratoryLoadDataResolver },
        component: ReportLoadComponent,
    },
    {
        path: 'load/:ID',
        data: { userAccess: ['LABORATORY_REPORT_LOAD', 'LABORATORY_ROLE_LOAD'] },
        canActivate: [UserAccessGuard],
        component: ReportLoadDataComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ReportRoutingModule {}
