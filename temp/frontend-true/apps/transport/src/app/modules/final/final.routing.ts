import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { FinalComponent } from './final.component';

const routes: Routes = [{ path: '', component: FinalComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class FinalRoutingModule {}
