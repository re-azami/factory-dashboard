import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { CourseComponent } from './course.component';

const routes: Routes = [{ path: '', component: CourseComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class CourseRoutingModule {}
