import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { AdminPersonsResolver, AdminSmsTypeResolver } from '../../resolvers';

import { LogContainerComponent } from './container/log-container.component';
import { LogDatabaseComponent } from './database/log-database.component';
import { LogSmsComponent } from './sms/log-sms.component';
import { LogVersionComponent } from './version/log-version.component';
import { LogMonthlyComponent } from './monthly/log-monthly.component';
import { LogResponseComponent } from './response/log-response.component';
import { LogExceptionComponent } from './exception/log-exception.component';

const routes: Routes = [
    { path: 'database', component: LogDatabaseComponent },
    { path: 'sms', resolve: { types: AdminSmsTypeResolver }, component: LogSmsComponent },
    {
        path: 'version',
        resolve: { persons: AdminPersonsResolver },
        component: LogVersionComponent,
    },
    { path: 'container', component: LogContainerComponent },
    { path: 'monthly', component: LogMonthlyComponent },
    { path: 'response', component: LogResponseComponent },
    { path: 'exception', component: LogExceptionComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class LogRoutingModule {}
