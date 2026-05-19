import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { InstituteComponent } from './institute.component';

const routes: Routes = [{ path: '', component: InstituteComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class InstituteRoutingModule {}
