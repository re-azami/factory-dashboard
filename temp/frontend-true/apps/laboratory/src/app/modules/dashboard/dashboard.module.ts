import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DashboardRoutingModule } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';
import { DashboardDailyComponent } from './daily/dashboard-daily.component';

@NgModule({
    declarations: [DashboardComponent, DashboardDailyComponent],
    imports: [CommonModule, DashboardRoutingModule, NgxHelperPipeModule, ChartModule, PageModule, MaterialModule],
})
export class DashboardModule {}
