import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { PageUserRetrievalComponent, PageUserSigninComponent } from '@lib/page';
import { UserGroupGuard, UserGuard, VisitorGuard } from '@lib/shared';

const routes: Routes = [
    { path: '', canActivate: [VisitorGuard], component: PageUserSigninComponent },
    { path: 'retrieval', canActivate: [VisitorGuard], component: PageUserRetrievalComponent },
    { path: 'dashboard', redirectTo: '/person' },

    {
        path: 'person',
        data: { menu: 'PERSON' },
        canActivate: [UserGuard],
        loadChildren: () => import('./modules/person/person.module').then((m) => m.PersonModule),
    },
    {
        path: 'admin',
        data: { menu: 'ADMIN', userGroup: 'MANAGER' },
        canActivate: [UserGuard, UserGroupGuard],
        loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule),
    },
    {
        path: 'log',
        data: { menu: 'LOG', userGroup: 'MANAGER' },
        canActivate: [UserGuard, UserGroupGuard],
        loadChildren: () => import('./modules/log/log.module').then((m) => m.LogModule),
    },
    {
        path: 'service/:APP',
        data: { menu: 'SERVICE', userGroup: 'MANAGER' },
        canActivate: [UserGuard, UserGroupGuard],
        loadChildren: () => import('./modules/service/service.module').then((m) => m.ServiceModule),
    },
    {
        path: 'tools',
        data: { menu: 'TOOLS', userGroup: 'MANAGER' },
        canActivate: [UserGuard, UserGroupGuard],
        loadChildren: () => import('./modules/tools/tools.module').then((m) => m.ToolsModule),
    },

    { path: '**', redirectTo: '/' },
];

@NgModule({ providers: [provideRouter(routes)] })
export class AppRoutingModule {}
