import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class DashboardRoutingModule {}
