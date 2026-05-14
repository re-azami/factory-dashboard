import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        data: { menu: 'DASHBOARD' },
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
    },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
