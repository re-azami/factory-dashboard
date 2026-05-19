import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { NotificationComponent } from './notification.component';

const routes: Routes = [{ path: '', component: NotificationComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class NotificationRoutingModule {}
