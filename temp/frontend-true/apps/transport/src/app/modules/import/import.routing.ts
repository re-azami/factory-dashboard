import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { TransportGroupsResolver } from '../../resolvers';

import { ImportComponent } from './import.component';

const routes: Routes = [
    { path: '', resolve: { groups: TransportGroupsResolver }, component: ImportComponent },
    { path: ':groupId', resolve: { groups: TransportGroupsResolver }, component: ImportComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ImportRoutingModule {}
