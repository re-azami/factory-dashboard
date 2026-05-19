import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ReportRoutingModule } from './report.routing';
import { ReportMemberComponent } from './member/report-member.component';

@NgModule({
    declarations: [ReportMemberComponent],
    imports: [CommonModule, ReportRoutingModule, ChartModule, PageModule],
})
export class ReportModule {}
