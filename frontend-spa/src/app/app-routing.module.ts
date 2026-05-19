import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: '/chat', pathMatch: 'full' },
    {
        path: 'chat',
        data: { menu: 'CHAT' },
        loadChildren: () => import('./pages/chat/chat.module').then((m) => m.ChatModule),
    },
    {
        path: 'dashboard',
        data: { menu: 'DASHBOARD' },
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
    },
    {
        path: 'history',
        data: { menu: 'HISTORY' },
        loadChildren: () => import('./pages/history/history.module').then((m) => m.HistoryModule),
    },
    { path: '**', redirectTo: '/chat' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
