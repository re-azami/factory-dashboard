import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { DailyComponent } from './daily.component';

const routes: Routes = [{ path: '', component: DailyComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class DailyRoutingModule {}
