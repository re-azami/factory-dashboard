import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { LaboratoryMiscResolver } from '../../resolvers';

import { MiscComponent } from './misc.component';
import { MiscCreateComponent } from './create/misc-create.component';
import { MiscUpdateComponent } from './update/misc-update.component';

const routes: Routes = [
    { path: '', component: MiscComponent },
    {
        path: 'create',
        data: { userAccess: 'LABORATORY_ROLE_MISC' },
        canActivate: [UserAccessGuard],
        component: MiscCreateComponent,
    },
    {
        path: 'update/:ID',
        data: { userAccess: 'LABORATORY_ROLE_MISC' },
        canActivate: [UserAccessGuard],
        resolve: { misc: LaboratoryMiscResolver },
        component: MiscUpdateComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class MiscRoutingModule {}
