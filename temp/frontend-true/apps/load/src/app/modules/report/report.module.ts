import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperCalendarModule } from '@webilix/ngx-helper/calendar';

import { ListModule } from '@lib/list';
import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DraftReportExportComponent, DraftReportTableComponent } from '../../components';

import { ReportRoutingModule } from './report.routing';

import { ReportActiveComponent } from './active/report-active.component';
import { ReportDailyTransporterComponent } from './daily-transporter/report-daily-transporter.component';

import { ReportDraftComponent } from './draft/report-draft.component';
import { ReportTruckComponent } from './truck/report-truck.component';

import { ReportPartyComponent } from './party/report-party.component';
import { ReportPartyDraftComponent } from './party/draft/report-party-draft.component';

import { ReportShipmentComponent } from './shipment/report-shipment.component';
import { ReportShipmentDraftComponent } from './shipment/draft/report-shipment-draft.component';

import { ReportTransporterComponent } from './transporter/report-transporter.component';
import { ReportTransporterDraftComponent } from './transporter/draft/report-transporter-draft.component';

import { ReportCargoComponent } from './cargo/report-cargo.component';
import { ReportCargoViewComponent } from './cargo/view/report-cargo-view.component';
import { ReportCargoDraftComponent } from './cargo/draft/report-cargo-draft.component';
import { ReportCargoChartComponent } from './cargo/chart/report-cargo-chart.component';
import { ReportCargoAttachmentComponent } from './cargo/attachment/report-cargo-attachment.component';

import { ReportOwnerComponent } from './owner/report-owner.component';
import { ReportOwnerDraftComponent } from './owner/draft/report-owner-draft.component';

@NgModule({
    declarations: [
        ReportActiveComponent,
        ReportDailyTransporterComponent,

        ReportDraftComponent,
        ReportTruckComponent,

        ReportPartyComponent,
        ReportPartyDraftComponent,

        ReportShipmentComponent,
        ReportShipmentDraftComponent,

        ReportTransporterComponent,
        ReportTransporterDraftComponent,

        ReportCargoComponent,
        ReportCargoViewComponent,
        ReportCargoDraftComponent,
        ReportCargoChartComponent,
        ReportCargoAttachmentComponent,

        ReportOwnerComponent,
        ReportOwnerDraftComponent,
    ],
    imports: [
        CommonModule,
        ReportRoutingModule,

        NgxHelperCalendarModule,

        ChartModule,
        ListModule,
        MaterialModule,
        PageModule,

        DraftReportExportComponent,
        DraftReportTableComponent,
    ],
})
export class ReportModule {}
