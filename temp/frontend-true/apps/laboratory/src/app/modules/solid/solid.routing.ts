import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratorySolidResolver } from '../../resolvers';

import { SolidComponent } from './solid.component';
import { SolidInfoComponent } from './info/solid-info.component';

const routes: Routes = [
    { path: '', component: SolidComponent },
    { path: 'info/:ID', resolve: { solid: LaboratorySolidResolver }, component: SolidInfoComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class SolidRoutingModule {}
