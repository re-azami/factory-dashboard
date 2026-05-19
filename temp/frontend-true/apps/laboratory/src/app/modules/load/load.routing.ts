import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryLoadResolver } from '../../resolvers';

import { LoadComponent } from './load.component';
import { LoadUpdateComponent } from './update/load-update.component';

const routes: Routes = [
    { path: '', component: LoadComponent },
    { path: 'update/:ID', resolve: { load: LaboratoryLoadResolver }, component: LoadUpdateComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class LoadRoutingModule {}
