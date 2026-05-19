import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LoadActiveOwnerResolver, LoadTruckResolver } from '../../resolvers';

import { TruckComponent } from './truck.component';
import { TruckInfoComponent } from './info/truck-info.component';
import { TruckAttachmentComponent } from './attachment/truck-attachment.component';

const routes: Routes = [
    { path: '', resolve: { owners: LoadActiveOwnerResolver }, component: TruckComponent },
    {
        path: 'info/:ID',
        resolve: { truck: LoadTruckResolver, owners: LoadActiveOwnerResolver },
        component: TruckInfoComponent,
    },
    {
        path: 'update/:ID',
        data: { action: 'update' },
        resolve: { truck: LoadTruckResolver, owners: LoadActiveOwnerResolver },
        component: TruckInfoComponent,
    },
    { path: 'attachment/:ID', resolve: { truck: LoadTruckResolver }, component: TruckAttachmentComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class TruckRoutingModule {}
