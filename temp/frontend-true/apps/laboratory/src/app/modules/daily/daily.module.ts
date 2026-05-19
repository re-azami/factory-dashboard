import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DailyRoutingModule } from './daily.routing';
import { DailyComponent } from './daily.component';
import { DailyCrusherComponent } from './crusher/daily-crusher.component';
import { DailyKhatkaComponent } from './khatka/daily-khatka.component';
import { DailyBlaineComponent } from './blaine/daily-blaine.component';
import { DailyDavisComponent } from './davis/daily-davis.component';
import { DailySolidComponent } from './solid/daily-solid.component';
import { DailyLoadComponent } from './load/daily-load.component';

@NgModule({
    declarations: [
        DailyComponent,
        DailyCrusherComponent,
        DailyKhatkaComponent,
        DailyBlaineComponent,
        DailyDavisComponent,
        DailySolidComponent,
        DailyLoadComponent,
    ],
    imports: [
        CommonModule,
        DailyRoutingModule,

        NgxHelperLoaderModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class DailyModule {}
