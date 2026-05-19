import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { HelpComponent } from './help.component';

const routes: Routes = [{ path: '', component: HelpComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class HelpRoutingModule {}
