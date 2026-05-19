import { NgModule } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { LaboratorySupplementaryResolver, LaboratorySupplementaryTestResolver } from '../../resolvers';

import { SupplementaryComponent } from './supplementary.component';
import { SupplementaryInfoComponent } from './info/supplementary-info.component';

import { SupplementaryTestCreateComponent } from './test/create/supplementary-test-create.component';
import { SupplementaryTestUpdateComponent } from './test/update/supplementary-test-update.component';

const routes: Routes = [
    { path: '', component: SupplementaryComponent },
    { path: ':ID', resolve: { supplementary: LaboratorySupplementaryResolver }, component: SupplementaryInfoComponent },
    {
        path: ':ID/create',
        resolve: { supplementary: LaboratorySupplementaryResolver },
        component: SupplementaryTestCreateComponent,
    },
    {
        path: ':ID/update/:TESTID',
        resolve: { supplementary: LaboratorySupplementaryResolver, test: LaboratorySupplementaryTestResolver },
        component: SupplementaryTestUpdateComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class SupplementaryRoutingModule {}
