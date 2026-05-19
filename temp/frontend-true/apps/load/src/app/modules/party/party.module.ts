import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { AttachmentComponent } from '../../components';

import { PartyRoutingModule } from './party.routing';
import { PartyComponent } from './party.component';
import { PartyCreateComponent } from './create/party-create.component';
import { PartyUpdateComponent } from './update/party-update.component';
import { PartyAttachmentComponent } from './attachment/party-attachment.component';

@NgModule({
    declarations: [PartyComponent, PartyCreateComponent, PartyUpdateComponent, PartyAttachmentComponent],
    imports: [CommonModule, PartyRoutingModule, NgxFormModule, AttachmentComponent, ListModule, MaterialModule, PageModule],
})
export class PartyModule {}
