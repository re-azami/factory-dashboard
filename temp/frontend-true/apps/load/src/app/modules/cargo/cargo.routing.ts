import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import {
    LoadActivePartyResolver,
    LoadActiveShipmentResolver,
    LoadActiveTransporterResolver,
    LoadCargoResolver,
} from '../../resolvers';

import { CargoComponent } from './cargo.component';
import { CargoCreateComponent } from './create/cargo-create.component';
import { CargoInfoComponent } from './info/cargo-info.component';
import { CargoTruckComponent } from './truck/cargo-truck.component';
import { CargoGroupComponent } from './group/cargo-group.component';
import { CargoAttachmentComponent } from './attachment/cargo-attachment.component';

const routes: Routes = [
    {
        path: '',
        resolve: { parties: LoadActivePartyResolver, shipments: LoadActiveShipmentResolver },
        component: CargoComponent,
    },
    {
        path: 'create/:CARGO',
        resolve: {
            parties: LoadActivePartyResolver,
            shipments: LoadActiveShipmentResolver,
            transporters: LoadActiveTransporterResolver,
        },
        component: CargoCreateComponent,
    },
    {
        path: 'info/:CARGO/:ID',
        resolve: {
            cargo: LoadCargoResolver,
            parties: LoadActivePartyResolver,
            shipments: LoadActiveShipmentResolver,
            transporters: LoadActiveTransporterResolver,
        },
        component: CargoInfoComponent,
    },
    {
        path: 'update/:CARGO/:ID',
        data: { action: 'update' },
        resolve: {
            cargo: LoadCargoResolver,
            parties: LoadActivePartyResolver,
            shipments: LoadActiveShipmentResolver,
            transporters: LoadActiveTransporterResolver,
        },
        component: CargoInfoComponent,
    },
    {
        path: 'truck/:ID',
        resolve: { cargo: LoadCargoResolver },
        component: CargoTruckComponent,
    },
    {
        path: 'group/:ID',
        resolve: { cargo: LoadCargoResolver },
        component: CargoGroupComponent,
    },
    {
        path: 'attachment/:ID',
        resolve: { cargo: LoadCargoResolver },
        component: CargoAttachmentComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class CargoRoutingModule {}
