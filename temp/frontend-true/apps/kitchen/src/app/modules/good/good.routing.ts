import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { KitchenGoodResolver } from '../../resolvers';

import { GoodComponent } from './good.component';
import { GoodInventoryComponent } from './inventory/good-inventory.component';

const routes: Routes = [
    { path: '', component: GoodComponent },
    { path: ':ID', resolve: { good: KitchenGoodResolver }, component: GoodInventoryComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class GoodRoutingModule {}
