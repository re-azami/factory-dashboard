import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperBoxModule } from '@webilix/ngx-helper/box';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperPaginationModule } from '@webilix/ngx-helper/pagination';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { LogRoutingModule } from './log.routing';
import { LogContainerComponent } from './container/log-container.component';
import { LogDatabaseComponent } from './database/log-database.component';
import { LogMonthlyComponent } from './monthly/log-monthly.component';
import { LogResponseComponent } from './response/log-response.component';
import { LogExceptionComponent } from './exception/log-exception.component';
import { LogSmsComponent } from './sms/log-sms.component';

import { LogVersionComponent } from './version/log-version.component';
import { LogVersionAppComponent } from './version/app/log-version-app.component';

@NgModule({
    declarations: [
        LogContainerComponent,
        LogDatabaseComponent,
        LogMonthlyComponent,
        LogResponseComponent,
        LogExceptionComponent,
        LogSmsComponent,

        LogVersionComponent,
        LogVersionAppComponent,
    ],
    imports: [
        CommonModule,
        LogRoutingModule,

        NgxHelperBoxModule,
        NgxHelperLoaderModule,
        NgxHelperListModule,
        NgxHelperPaginationModule,
        NgxHelperPipeModule,

        ListModule,
        ChartModule,
        MaterialModule,
        PageModule,
    ],
})
export class LogModule {}
