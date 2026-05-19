import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { AdminComponent } from './admin.component';

const routes: Routes = [{ path: '', component: AdminComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class AdminRoutingModule {}
