import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { LoadTransporterResolver } from '../../resolvers';

import { TransporterComponent } from './transporter.component';
import { TransporterAttachmentComponent } from './attachment/transporter-attachment.component';

const routes: Routes = [
    { path: '', component: TransporterComponent },
    { path: 'attachment/:ID', resolve: { transporter: LoadTransporterResolver }, component: TransporterAttachmentComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class TransporterRoutingModule {}
