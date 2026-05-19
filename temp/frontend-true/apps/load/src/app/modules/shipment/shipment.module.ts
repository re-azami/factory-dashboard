import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { ShipmentRoutingModule } from './shipment.routing';
import { ShipmentComponent } from './shipment.component';
import { ShipmentCreateComponent } from './create/shipment-create.component';
import { ShipmentUpdateComponent } from './update/shipment-update.component';

@NgModule({
    declarations: [ShipmentComponent, ShipmentCreateComponent, ShipmentUpdateComponent],
    imports: [CommonModule, ShipmentRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class ShipmentModule {}
