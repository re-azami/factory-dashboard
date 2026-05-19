import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { MiscComponent } from './misc.component';

const routes: Routes = [{ path: '', component: MiscComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class MiscRoutingModule {}
