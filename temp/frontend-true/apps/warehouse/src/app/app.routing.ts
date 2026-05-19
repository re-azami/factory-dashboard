import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

import { WarehouseCategoriesResolver } from './resolvers';

const routes: Routes = [
    { path: '', canActivate: [VisitorGuard], component: PageUserSigninComponent },
    { path: 'retrieval', canActivate: [VisitorGuard], component: PageUserRetrievalComponent },
    {
        path: 'dashboard',
        data: { menu: 'DASHBOARD' },
        canActivate: [UserGuard],
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
    },

    {
        path: 'category',
        data: { menu: 'CATEGORY', userAccess: 'WAREHOUSE_CATEGORY' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/category/category.module').then((m) => m.CategoryModule),
    },
    {
        path: 'stock',
        data: { menu: 'STOCK', userAccess: ['WAREHOUSE_STOCK', 'WAREHOUSE_DELETE'] },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { categories: WarehouseCategoriesResolver },
        loadChildren: () => import('./modules/stock/stock.module').then((m) => m.StockModule),
    },
    {
        path: 'search',
        data: { menu: 'SEARCH', userAccess: ['WAREHOUSE_STOCK', 'WAREHOUSE_INVENTORY'] },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { categories: WarehouseCategoriesResolver },
        loadChildren: () => import('./modules/search/search.module').then((m) => m.SearchModule),
    },
    {
        path: 'export',
        data: { menu: 'TOOLS', userAccess: 'WAREHOUSE_EXPORT' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { categories: WarehouseCategoriesResolver },
        loadChildren: () => import('./modules/export/export.module').then((m) => m.ExportModule),
    },
    {
        path: 'help',
        data: { menu: 'TOOLS', userAccess: 'WAREHOUSE_HELP' },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { categories: WarehouseCategoriesResolver },
        loadChildren: () => import('./modules/help/help.module').then((m) => m.HelpModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
