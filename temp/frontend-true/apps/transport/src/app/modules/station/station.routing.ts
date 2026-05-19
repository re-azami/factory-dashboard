import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { TransportGroupResolver, TransportStationResolver, TransportStationsResolver } from '../../resolvers';

import { StationComponent } from './station.component';
import { StationCompareComponent } from './compare/station-compare.component';
import { StationMapCreateComponent } from './map/create/station-map-create.component';
import { StationMapUpdateComponent } from './map/update/station-map-update.component';

const routes: Routes = [
    { path: '', component: StationComponent },
    {
        path: 'compare',
        data: { header: 'مقایسه' },
        resolve: { stations: TransportStationsResolver },
        component: StationCompareComponent,
    },
    {
        path: 'map/:groupId/create',
        resolve: { group: TransportGroupResolver },
        data: { header: 'محاسبه' },
        component: StationMapCreateComponent,
    },
    {
        path: 'map/:stationId',
        data: { header: 'مشاهده' },
        resolve: { station: TransportStationResolver },
        component: StationMapCreateComponent,
    },
    {
        path: 'map/:stationId/update',
        data: { header: 'ویرایش' },
        resolve: { station: TransportStationResolver },
        component: StationMapUpdateComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class StationRoutingModule {}
