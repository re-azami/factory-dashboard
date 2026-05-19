import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LoadOwnerResolver } from '../../resolvers';

import { OwnerComponent } from './owner.component';
import { OwnerCreateComponent } from './create/owner-create.component';
import { OwnerUpdateComponent } from './update/owner-update.component';
import { OwnerAttachmentComponent } from './attachment/owner-attachment.component';

const routes: Routes = [
    { path: '', component: OwnerComponent },
    { path: 'create', component: OwnerCreateComponent },
    { path: 'update/:ID', resolve: { owner: LoadOwnerResolver }, component: OwnerUpdateComponent },
    { path: 'attachment/:ID', resolve: { owner: LoadOwnerResolver }, component: OwnerAttachmentComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class OwnerRoutingModule {}
