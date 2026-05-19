import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperValueModule } from '@webilix/ngx-helper/value';

import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DashboardRoutingModule } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';
import { DashboardInfoComponent } from './info/dashboard-info.component';

@NgModule({
    declarations: [DashboardComponent, DashboardInfoComponent],
    imports: [
        CommonModule,
        DashboardRoutingModule,

        NgxHelperLoaderModule,
        NgxHelperPipeModule,
        NgxHelperValueModule,

        ChartModule,
        MaterialModule,
        PageModule,
    ],
})
export class DashboardModule {}
