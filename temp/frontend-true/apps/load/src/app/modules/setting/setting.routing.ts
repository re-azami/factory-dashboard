import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { SettingComponent } from './setting.component';

const routes: Routes = [{ path: '', component: SettingComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class SettingRoutingModule {}
