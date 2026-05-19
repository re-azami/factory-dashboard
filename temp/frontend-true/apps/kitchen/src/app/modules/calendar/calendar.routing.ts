import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { KitchenServingResolver } from '../../resolvers';

import { CalendarComponent } from './calendar.component';
import { CalendarServingComponent } from './serving/calendar-serving.component';

const routes: Routes = [
    { path: '', component: CalendarComponent },
    {
        path: ':ID',
        data: { userAccess: 'KITCHEN_SERVING' },
        canActivate: [UserAccessGuard],
        resolve: { serving: KitchenServingResolver },
        component: CalendarServingComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class CalendarRoutingModule {}
