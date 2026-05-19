import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ChartModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DashboardRoutingModule } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';

@NgModule({
    declarations: [DashboardComponent],
    imports: [
        CommonModule,
        RouterLink,
        DashboardRoutingModule,

        NgxHelperLoaderModule,
        NgxHelperPipeModule,

        ChartModule,
        PageModule,
    ],
})
export class DashboardModule {}
