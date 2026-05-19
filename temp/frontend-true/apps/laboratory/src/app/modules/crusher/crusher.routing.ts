import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryCrusherResolver } from '../../resolvers';

import { CrusherComponent } from './crusher.component';
import { CrusherInfoComponent } from './info/crusher-info.component';

const routes: Routes = [
    { path: '', component: CrusherComponent },
    { path: 'info/:ID', resolve: { crusher: LaboratoryCrusherResolver }, component: CrusherInfoComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class CrusherRoutingModule {}
