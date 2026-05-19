import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryDavisResolver } from '../../resolvers';

import { DavisComponent } from './davis.component';
import { DavisCreateComponent } from './create/davis-create.component';
import { DavisUpdateComponent } from './update/davis-update.component';

const routes: Routes = [
    { path: '', component: DavisComponent },
    { path: 'create/:SHIFT', component: DavisCreateComponent },
    { path: 'update/:ID', resolve: { davis: LaboratoryDavisResolver }, component: DavisUpdateComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class DavisRoutingModule {}
