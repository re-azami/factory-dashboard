import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { CalendarRoutingModule } from './calendar.routing';
import { CalendarComponent } from './calendar.component';
import { CalendarServingComponent } from './serving/calendar-serving.component';

@NgModule({
    declarations: [CalendarComponent, CalendarServingComponent],
    imports: [
        CommonModule,
        RouterLink,
        CalendarRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        PageModule,
        MaterialModule,
    ],
})
export class CalendarModule {}
