import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { GroupComponent } from './group.component';

const routes: Routes = [{ path: '', component: GroupComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class GroupRoutingModule {}
