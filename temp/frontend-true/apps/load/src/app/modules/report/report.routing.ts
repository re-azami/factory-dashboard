import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import {
    LoadReportCargoInfoResolver,
    LoadReportCargoMonthResolver,
    LoadReportOwnerInfoResolver,
    LoadReportPartyInfoResolver,
    LoadReportShipmentInfoResolver,
    LoadReportTransporterInfoResolver,
    LoadReportTruckInfoResolver,
} from '../../resolvers';

import { ReportActiveComponent } from './active/report-active.component';
import { ReportDraftComponent } from './draft/report-draft.component';
import { ReportTruckComponent } from './truck/report-truck.component';
import { ReportDailyTransporterComponent } from './daily-transporter/report-daily-transporter.component';

import { ReportPartyComponent } from './party/report-party.component';
import { ReportPartyDraftComponent } from './party/draft/report-party-draft.component';

import { ReportShipmentComponent } from './shipment/report-shipment.component';
import { ReportShipmentDraftComponent } from './shipment/draft/report-shipment-draft.component';

import { ReportTransporterComponent } from './transporter/report-transporter.component';
import { ReportTransporterDraftComponent } from './transporter/draft/report-transporter-draft.component';

import { ReportCargoComponent } from './cargo/report-cargo.component';
import { ReportCargoDraftComponent } from './cargo/draft/report-cargo-draft.component';
import { ReportCargoChartComponent } from './cargo/chart/report-cargo-chart.component';
import { ReportCargoAttachmentComponent } from './cargo/attachment/report-cargo-attachment.component';

import { ReportOwnerComponent } from './owner/report-owner.component';
import { ReportOwnerDraftComponent } from './owner/draft/report-owner-draft.component';

const routes: Routes = [
    {
        path: 'active',
        data: {
            type: 'DRAFT',
            userAccess: [
                'LOAD_REPORT_ACTIVE',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserAccessGuard],
        component: ReportActiveComponent,
    },
    {
        path: 'draft',
        data: { type: 'DRAFT', userAccess: 'LOAD_REPORT_DRAFT' },
        canActivate: [UserAccessGuard],
        component: ReportDraftComponent,
    },
    {
        path: 'daily',
        data: { type: 'DAILY', userAccess: 'LOAD_REPORT_DAILY' },
        canActivate: [UserAccessGuard],
        component: ReportDraftComponent,
    },
    {
        path: 'daily-transporter',
        data: { userAccess: ['LOAD_REPORT_DAILY_TRANSPORTER', 'LOAD_ROLE_TRAFFIC', 'LOAD_ROLE_WEIGHT'] },
        canActivate: [UserAccessGuard],
        component: ReportDailyTransporterComponent,
    },

    {
        path: 'party',
        data: { userAccess: 'LOAD_REPORT_PARTY' },
        canActivate: [UserAccessGuard],
        component: ReportPartyComponent,
    },
    {
        path: 'party/:ID',
        data: { userAccess: 'LOAD_REPORT_PARTY' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportPartyInfoResolver },
        component: ReportPartyDraftComponent,
    },
    {
        path: 'shipment',
        data: { userAccess: 'LOAD_REPORT_SHIPMENT' },
        canActivate: [UserAccessGuard],
        component: ReportShipmentComponent,
    },
    {
        path: 'shipment/:ID',
        data: { userAccess: 'LOAD_REPORT_SHIPMENT' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportShipmentInfoResolver },
        component: ReportShipmentDraftComponent,
    },
    {
        path: 'transporter',
        data: { userAccess: 'LOAD_REPORT_TRANSPORTER' },
        canActivate: [UserAccessGuard],
        component: ReportTransporterComponent,
    },
    {
        path: 'transporter/:ID',
        data: { userAccess: 'LOAD_REPORT_TRANSPORTER' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportTransporterInfoResolver },
        component: ReportTransporterDraftComponent,
    },
    {
        path: 'cargo',
        data: { userAccess: 'LOAD_REPORT_CARGO' },
        canActivate: [UserAccessGuard],
        component: ReportCargoComponent,
    },
    {
        path: 'cargo/:ID',
        data: { userAccess: 'LOAD_REPORT_CARGO' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportCargoInfoResolver },
        component: ReportCargoDraftComponent,
    },
    {
        path: 'cargo/:ID/chart',
        data: { userAccess: 'LOAD_REPORT_CARGO' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportCargoInfoResolver, months: LoadReportCargoMonthResolver },
        component: ReportCargoChartComponent,
    },
    {
        path: 'cargo/:ID/attachment',
        data: { userAccess: 'LOAD_REPORT_CARGO' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportCargoInfoResolver },
        component: ReportCargoAttachmentComponent,
    },
    {
        path: 'owner',
        data: { userAccess: 'LOAD_REPORT_OWNER' },
        canActivate: [UserAccessGuard],
        component: ReportOwnerComponent,
    },
    {
        path: 'owner/:ID',
        data: { userAccess: 'LOAD_REPORT_OWNER' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportOwnerInfoResolver },
        component: ReportOwnerDraftComponent,
    },
    {
        path: 'truck/:ID',
        data: { userAccess: 'LOAD_REPORT_TRUCK' },
        canActivate: [UserAccessGuard],
        resolve: { info: LoadReportTruckInfoResolver },
        runGuardsAndResolvers: 'paramsChange',
        component: ReportTruckComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ReportRoutingModule {}
