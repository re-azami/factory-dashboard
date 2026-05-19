import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { AdminPersonResolver } from '../../resolvers';

import { PersonComponent } from './person.component';
import { PersonAccessComponent } from './access/person-access.component';

const routes: Routes = [
    { path: '', component: PersonComponent },
    {
        path: ':personId/access/:app',
        data: { header: 'دسترسی‌های کاربر' },
        resolve: { person: AdminPersonResolver },
        component: PersonAccessComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class PersonRoutingModule {}
