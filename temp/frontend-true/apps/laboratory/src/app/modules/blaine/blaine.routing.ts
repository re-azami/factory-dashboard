import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { BlaineComponent } from './blaine.component';

const routes: Routes = [{ path: '', component: BlaineComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class BlaineRoutingModule {}
