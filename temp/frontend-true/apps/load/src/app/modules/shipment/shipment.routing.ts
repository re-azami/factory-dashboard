import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { ShipmentComponent } from './shipment.component';

const routes: Routes = [{ path: '', component: ShipmentComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class ShipmentRoutingModule {}
