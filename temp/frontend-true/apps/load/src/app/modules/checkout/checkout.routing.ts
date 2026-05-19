import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { CheckoutComponent } from './checkout.component';

const routes: Routes = [{ path: '', component: CheckoutComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class CheckoutRoutingModule {}
