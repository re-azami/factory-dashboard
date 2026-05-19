import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TooltipParkingComponent } from '../../components';

import { ParkingRoutingModule } from './parking.routing';
import { ParkingComponent } from './parking.component';
import { ParkingCreateComponent } from './create/parking-create.component';
import { ParkingUpdateComponent } from './update/parking-update.component';
import { ParkingMapComponent } from './map/parking-map.component';
import { ParkingVehiclesComponent } from './vehicles/parking-vehicles.component';

import { ParkingVehicleComponent } from './vehicle/parking-vehicle.component';
import { ParkingVehicleCreateComponent } from './vehicle/create/parking-vehicle-create.component';
import { ParkingVehicleUpdateComponent } from './vehicle/update/parking-vehicle-update.component';
import { ParkingVehicleTransferComponent } from './vehicle/transfer/parking-vehicle-transfer.component';

@NgModule({
    declarations: [
        ParkingComponent,
        ParkingCreateComponent,
        ParkingUpdateComponent,
        ParkingMapComponent,
        ParkingVehiclesComponent,

        ParkingVehicleComponent,
        ParkingVehicleCreateComponent,
        ParkingVehicleUpdateComponent,
        ParkingVehicleTransferComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        ParkingRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,

        ListModule,
        MaterialModule,
        PageModule,

        TooltipParkingComponent,
    ],
})
export class ParkingModule {}
