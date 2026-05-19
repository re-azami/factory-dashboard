import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { LaboratoryCrusherResolver, LaboratoryKhatkaResolver } from '../../resolvers';

import { ProductionCrusherComponent } from './crusher/production-crusher.component';
import { ProductionCrusherInfoComponent } from './crusher/info/production-crusher-info.component';

import { ProductionKhatkaComponent } from './khatka/production-khatka.component';
import { ProductionKhatkaInfoComponent } from './khatka/info/production-khatka-info.component';

const routes: Routes = [
    {
        path: 'crusher',
        data: { userAccess: 'LABORATORY_PRODUCTION_CRUSHER' },
        canActivate: [UserAccessGuard],
        children: [
            { path: '', component: ProductionCrusherComponent },
            {
                path: ':ID',
                resolve: { crusher: LaboratoryCrusherResolver },
                component: ProductionCrusherInfoComponent,
            },
        ],
    },
    {
        path: 'khatka',
        data: { userAccess: 'LABORATORY_PRODUCTION_KHATKA' },
        canActivate: [UserAccessGuard],
        children: [
            { path: '', component: ProductionKhatkaComponent },
            {
                path: ':ID',
                resolve: { khatka: LaboratoryKhatkaResolver },
                component: ProductionKhatkaInfoComponent,
            },
        ],
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class ProductionRoutingModule {}
