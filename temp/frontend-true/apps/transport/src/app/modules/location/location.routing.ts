import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { TransportGroupResolver, TransportLocationResolver, TransportLocationsResolver } from '../../resolvers';

import { LocationComponent } from './location.component';
import { LocationMapComponent } from './map/location-map.component';
import { LocationPassengersComponent } from './passengers/location-passengers.component';
import { LocationPassengerComponent } from './passenger/location-passenger.component';

const routes: Routes = [
    { path: ':groupId', resolve: { group: TransportGroupResolver }, component: LocationComponent },
    { path: ':groupId/map', resolve: { group: TransportGroupResolver }, component: LocationMapComponent },
    {
        path: ':groupId/:locationId/passenger',
        resolve: {
            group: TransportGroupResolver,
            location: TransportLocationResolver,
            locations: TransportLocationsResolver,
        },
        component: LocationPassengerComponent,
    },
    { path: ':groupId/passengers', resolve: { group: TransportGroupResolver }, component: LocationPassengersComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class LocationRoutingModule {}
