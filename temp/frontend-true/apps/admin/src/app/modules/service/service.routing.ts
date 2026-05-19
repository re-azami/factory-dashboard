import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { ServiceComponent } from './service.component';

const routes: Routes = [{ path: '', component: ServiceComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class ServiceRoutingModule {}
