import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { TransportParkingResolver, TransportParkingsResolver } from '../../resolvers';

import { ParkingComponent } from './parking.component';
import { ParkingMapComponent } from './map/parking-map.component';
import { ParkingVehiclesComponent } from './vehicles/parking-vehicles.component';
import { ParkingVehicleComponent } from './vehicle/parking-vehicle.component';

const routes: Routes = [
    { path: '', component: ParkingComponent },
    { path: 'map', component: ParkingMapComponent },
    { path: 'vehicles', component: ParkingVehiclesComponent },
    {
        path: ':parkingId/vehicle',
        resolve: { parking: TransportParkingResolver, parkings: TransportParkingsResolver },
        component: ParkingVehicleComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ParkingRoutingModule {}
