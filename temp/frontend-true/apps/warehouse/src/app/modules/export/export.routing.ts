import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { ExportComponent } from './export.component';

const routes: Routes = [
    { path: '', redirectTo: '/export/', pathMatch: 'full' },
    { path: ':ID', component: ExportComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ExportRoutingModule {}
