import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { CategoryComponent } from './category.component';

const routes: Routes = [
    { path: '', redirectTo: '/category/', pathMatch: 'full' },
    { path: ':ID', component: CategoryComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class CategoryRoutingModule {}
