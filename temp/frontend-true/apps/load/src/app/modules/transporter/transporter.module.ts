import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { AttachmentComponent } from '../../components';

import { TransporterRoutingModule } from './transporter.routing';
import { TransporterComponent } from './transporter.component';
import { TransporterCreateComponent } from './create/transporter-create.component';
import { TransporterUpdateComponent } from './update/transporter-update.component';
import { TransporterAttachmentComponent } from './attachment/transporter-attachment.component';

@NgModule({
    declarations: [
        TransporterComponent,
        TransporterCreateComponent,
        TransporterUpdateComponent,
        TransporterAttachmentComponent,
    ],
    imports: [CommonModule, TransporterRoutingModule, NgxFormModule, AttachmentComponent, ListModule, PageModule],
})
export class TransporterModule {}
