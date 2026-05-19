import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { AlertComponent } from './alert.component';

const routes: Routes = [{ path: '', component: AlertComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class AlertRoutingModule {}
