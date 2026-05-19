import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserAccessGuard, UserGuard, VisitorGuard } from '@lib/shared';

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
        data: { menu: 'TOOLS', userAccess: 'TRANSPORT_GROUP' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/group/group.module').then((m) => m.GroupModule),
    },
    {
        path: 'location',
        data: { menu: 'TOOLS', userAccess: 'TRANSPORT_LOCATION' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/location/location.module').then((m) => m.LocationModule),
    },
    {
        path: 'parking',
        data: { menu: 'TOOLS', userAccess: 'TRANSPORT_PARKING' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/parking/parking.module').then((m) => m.ParkingModule),
    },
    {
        path: 'import',
        data: { menu: 'TOOLS', userAccess: 'TRANSPORT_IMPORT' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/import/import.module').then((m) => m.ImportModule),
    },
    {
        path: 'station',
        data: { menu: 'STATION', userAccess: 'TRANSPORT_ROLE_STATION' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/station/station.module').then((m) => m.StationModule),
    },
    {
        path: 'route',
        data: { menu: 'ROUTE', userAccess: 'TRANSPORT_ROLE_ROUTE' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/route/route.module').then((m) => m.RouteModule),
    },
    {
        path: 'final',
        data: { menu: 'ROUTE', userAccess: 'TRANSPORT_FINAL' },
        canActivate: [UserGuard, UserAccessGuard],
        loadChildren: () => import('./modules/final/final.module').then((m) => m.FinalModule),
    },

    { path: 'ticket', canActivate: [UserGuard], loadChildren: () => import('@lib/ticket').then((m) => m.TicketModule) },
    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
