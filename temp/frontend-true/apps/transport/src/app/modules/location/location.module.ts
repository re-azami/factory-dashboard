import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TooltipLocationComponent } from '../../components';

import { LocationRoutingModule } from './location.routing';
import { LocationComponent } from './location.component';
import { LocationCreateComponent } from './create/location-create.component';
import { LocationUpdateComponent } from './update/location-update.component';
import { LocationMapComponent } from './map/location-map.component';
import { LocationGroupComponent } from './group/location-group.component';
import { LocationPassengersComponent } from './passengers/location-passengers.component';

import { LocationPassengerComponent } from './passenger/location-passenger.component';
import { LocationPassengerCreateComponent } from './passenger/create/location-passenger-create.component';
import { LocationPassengerUpdateComponent } from './passenger/update/location-passenger-update.component';
import { LocationPassengerTransferComponent } from './passenger/transfer/location-passenger-transfer.component';

@NgModule({
    declarations: [
        LocationComponent,
        LocationCreateComponent,
        LocationUpdateComponent,
        LocationMapComponent,
        LocationGroupComponent,
        LocationPassengersComponent,

        LocationPassengerComponent,
        LocationPassengerCreateComponent,
        LocationPassengerUpdateComponent,
        LocationPassengerTransferComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        LocationRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,

        ListModule,
        MaterialModule,
        PageModule,

        TooltipLocationComponent,
    ],
})
export class LocationModule {}
