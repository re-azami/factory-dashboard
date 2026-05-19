import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperParamModule } from '@webilix/ngx-helper/param';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { FlowRoutingModule } from './flow.routing';
import { FlowComponent } from './flow.component';
import { FlowPlateComponent } from './plate/flow-plate.component';
import { FlowScanComponent } from './scan/flow-scan.component';

import { FlowOutWeightEmptyComponent } from './out/weight-empty/flow-out-weight-empty.component';
import { FlowOutLoadingComponent } from './out/loading/flow-out-loading.component';
import { FlowOutWeightFullComponent } from './out/weight-full/flow-out-weight-full.component';
import { FlowOutExitComponent } from './out/exit/flow-out-exit.component';

import { FlowInEnterMineComponent } from './in/enter-mine/flow-in-enter-mine.component';
import { FlowInLoadingMineComponent } from './in/loading-mine/flow-in-loading-mine.component';
import { FlowInExitMineComponent } from './in/exit-mine/flow-in-exit-mine.component';
import { FlowInEnterComponent } from './in/enter/flow-in-enter.component';
import { FlowInWeightFullComponent } from './in/weight-full/flow-in-weight-full.component';
import { FlowInDischargeComponent } from './in/discharge/flow-in-discharge.component';
import { FlowInWeightEmptyComponent } from './in/weight-empty/flow-in-weight-empty.component';
import { FlowInExitComponent } from './in/exit/flow-in-exit.component';

import { FlowBuyWeightFullComponent } from './buy/weight-full/flow-buy-weight-full.component';
import { FlowBuyDischargeComponent } from './buy/discharge/flow-buy-discharge.component';
import { FlowBuyWeightEmptyComponent } from './buy/weight-empty/flow-buy-weight-empty.component';
import { FlowBuyExitComponent } from './buy/exit/flow-buy-exit.component';

@NgModule({
    declarations: [
        FlowComponent,
        FlowPlateComponent,
        FlowScanComponent,

        FlowOutWeightEmptyComponent,
        FlowOutLoadingComponent,
        FlowOutWeightFullComponent,
        FlowOutExitComponent,

        FlowInEnterMineComponent,
        FlowInLoadingMineComponent,
        FlowInExitMineComponent,
        FlowInEnterComponent,
        FlowInWeightFullComponent,
        FlowInDischargeComponent,
        FlowInWeightEmptyComponent,
        FlowInExitComponent,

        FlowBuyWeightFullComponent,
        FlowBuyDischargeComponent,
        FlowBuyWeightEmptyComponent,
        FlowBuyExitComponent,
    ],
    imports: [
        CommonModule,
        ZXingScannerModule,
        FlowRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperParamModule,
        NgxHelperPlateModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class FlowModule {}
