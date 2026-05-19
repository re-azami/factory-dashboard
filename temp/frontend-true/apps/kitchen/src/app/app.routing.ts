import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

import { KitchenActiveGroupResolver } from './resolvers';

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
        path: 'group',
        data: { menu: 'WAREHOUSE', userAccess: 'KITCHEN_GROUP' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/group/group.module').then((m) => m.GroupModule),
    },
    {
        path: 'good',
        data: { menu: 'WAREHOUSE', userAccess: ['KITCHEN_GOOD', 'KITCHEN_INVENTORY'] },
        canActivate: [UserGuard, UserAccessGuard],
        resolve: { groups: KitchenActiveGroupResolver },
        loadChildren: () => import('./modules/good/good.module').then((m) => m.GoodModule),
    },
    {
        path: 'recipe',
        data: { menu: 'RESTAURANT', userAccess: 'KITCHEN_RECIPE' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/recipe/recipe.module').then((m) => m.RecipeModule),
    },
    {
        path: 'calendar',
        data: { menu: 'RESTAURANT', userAccess: ['KITCHEN_CALENDAR', 'KITCHEN_SERVING'] },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/calendar/calendar.module').then((m) => m.CalendarModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
