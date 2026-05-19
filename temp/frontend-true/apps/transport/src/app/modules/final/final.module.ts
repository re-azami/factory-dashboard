import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { MaterialModule } from '@lib/modules';

import { TooltipPathComponent } from '../../components';

import { FinalRoutingModule } from './final.routing';
import { FinalComponent } from './final.component';

@NgModule({
    declarations: [FinalComponent],
    imports: [
        CommonModule,
        FinalRoutingModule,

        NgxHelperMenuModule,
        NgxHelperPipeModule,

        MaterialModule,

        TooltipPathComponent,
    ],
})
export class FinalModule {}
