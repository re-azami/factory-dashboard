import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LocationComponent } from './location.component';

const routes: Routes = [{ path: '', component: LocationComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class LocationRoutingModule {}
