import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LoadPartyResolver } from '../../resolvers';

import { PartyComponent } from './party.component';
import { PartyAttachmentComponent } from './attachment/party-attachment.component';

const routes: Routes = [
    { path: '', component: PartyComponent },
    { path: 'attachment/:ID', resolve: { party: LoadPartyResolver }, component: PartyAttachmentComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class PartyRoutingModule {}
