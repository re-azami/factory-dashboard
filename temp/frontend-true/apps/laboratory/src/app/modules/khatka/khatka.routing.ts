import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratoryKhatkaResolver } from '../../resolvers';

import { KhatkaComponent } from './khatka.component';
import { KhatkaInfoComponent } from './info/khatka-info.component';

const routes: Routes = [
    { path: '', component: KhatkaComponent },
    { path: 'info/:ID', resolve: { khatka: LaboratoryKhatkaResolver }, component: KhatkaInfoComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class KhatkaRoutingModule {}
