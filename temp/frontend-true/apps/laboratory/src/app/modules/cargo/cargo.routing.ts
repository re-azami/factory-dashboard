import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryCargoResolver } from '../../resolvers';

import { CargoComponent } from './cargo.component';
import { CargoMixedCreateComponent } from './mixed/create/cargo-mixed-create.component';
import { CargoMixedUpdateComponent } from './mixed/update/cargo-mixed-update.component';

const routes: Routes = [
    { path: '', component: CargoComponent },
    { path: 'mixed', component: CargoMixedCreateComponent },
    { path: 'mixed/:ID', resolve: { cargo: LaboratoryCargoResolver }, component: CargoMixedUpdateComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class CargoRoutingModule {}
