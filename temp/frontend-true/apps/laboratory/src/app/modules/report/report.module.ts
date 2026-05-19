import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatMenuModule } from '@angular/material/menu';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ReportRoutingModule } from './report.routing';

import { ReportAverageComponent } from './average/report-average.component';
import { ReportAverageTestComponent } from './average/test/report-average-test.component';

import { ReportCrusherComponent } from './crusher/report-crusher.component';
import { ReportCrusherDataComponent } from './crusher/data/report-crusher-data.component';
import { ReportCrusherLocationComponent } from './crusher/location/report-crusher-location.component';

import { ReportKhatkaComponent } from './khatka/report-khatka.component';
import { ReportKhatkaDataComponent } from './khatka/data/report-khatka-data.component';
import { ReportKhatkaLocationComponent } from './khatka/location/report-khatka-location.component';

import { ReportLoadComponent } from './load/report-load.component';
import { ReportLoadDataComponent } from './load/data/report-load-data.component';

@NgModule({
    declarations: [
        ReportAverageComponent,
        ReportAverageTestComponent,

        ReportCrusherComponent,
        ReportCrusherDataComponent,
        ReportCrusherLocationComponent,

        ReportKhatkaComponent,
        ReportKhatkaDataComponent,
        ReportKhatkaLocationComponent,

        ReportLoadComponent,
        ReportLoadDataComponent,
    ],
    imports: [
        CommonModule,
        MatMenuModule,
        ReportRoutingModule,

        NgxHelperLoaderModule,
        NgxHelperPipeModule,

        ChartModule,
        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class ReportModule {}
