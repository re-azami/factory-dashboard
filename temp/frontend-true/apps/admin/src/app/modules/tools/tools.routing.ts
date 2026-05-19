import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LaboratoryLoadComponent } from './laboratory-load/laboratory-load.component';

const routes: Routes = [{ path: 'laboratory-load', component: LaboratoryLoadComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class ToolsRoutingModule {}
