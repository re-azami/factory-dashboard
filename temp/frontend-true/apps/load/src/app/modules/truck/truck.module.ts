import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperValueModule } from '@webilix/ngx-helper/value';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { AttachmentComponent, DraftMonthlyChartComponent } from '../../components';

import { TruckRoutingModule } from './truck.routing';
import { TruckComponent } from './truck.component';
import { TruckCargoComponent } from './cargo/truck-cargo.component';
import { TruckCreateComponent } from './create/truck-create.component';
import { TruckAttachmentComponent } from './attachment/truck-attachment.component';

import { TruckInfoComponent } from './info/truck-info.component';
import { TruckInfoCargoComponent } from './info/cargo/truck-info-cargo.component';

import { TruckUpdateComponent } from './update/truck-update.component';
import { TruckUpdatePlateComponent } from './update/plate/truck-update-plate.component';
import { TruckUpdateOwnerComponent } from './update/owner/truck-update-owner.component';
import { TruckUpdateDriverComponent } from './update/driver/truck-update-driver.component';

@NgModule({
    declarations: [
        TruckComponent,
        TruckCargoComponent,
        TruckCreateComponent,
        TruckAttachmentComponent,

        TruckInfoComponent,
        TruckInfoCargoComponent,

        TruckUpdateComponent,
        TruckUpdatePlateComponent,
        TruckUpdateOwnerComponent,
        TruckUpdateDriverComponent,
    ],
    imports: [
        CommonModule,
        TruckRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperValueModule,

        ListModule,
        PageModule,

        AttachmentComponent,
        DraftMonthlyChartComponent,
    ],
})
export class TruckModule {}
