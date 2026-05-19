import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { CargoRoutingModule } from './cargo.routing';
import { CargoComponent } from './cargo.component';
import { CargoCreateComponent } from './create/cargo-create.component';
import { CargoUpdateComponent } from './update/cargo-update.component';
import { CargoMoveComponent } from './move/cargo-move.component';

import { CargoMixedCreateComponent } from './mixed/create/cargo-mixed-create.component';
import { CargoMixedUpdateComponent } from './mixed/update/cargo-mixed-update.component';
import { CargoMixedPortionComponent } from './mixed/portion/cargo-mixed-portion.component';

@NgModule({
    declarations: [
        CargoComponent,
        CargoCreateComponent,
        CargoUpdateComponent,
        CargoMoveComponent,

        CargoMixedCreateComponent,
        CargoMixedUpdateComponent,
        CargoMixedPortionComponent,
    ],
    imports: [
        CommonModule,
        CargoRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class CargoModule {}
