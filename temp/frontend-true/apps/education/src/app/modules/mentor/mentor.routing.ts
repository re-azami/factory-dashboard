import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { MentorComponent } from './mentor.component';

const routes: Routes = [{ path: '', component: MentorComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class MentorRoutingModule {}
