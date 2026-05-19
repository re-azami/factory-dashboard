import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { AttachmentComponent } from '../../components';

import { OwnerComponent } from './owner.component';
import { OwnerRoutingModule } from './owner.routing';
import { OwnerCreateComponent } from './create/owner-create.component';
import { OwnerUpdateComponent } from './update/owner-update.component';
import { OwnerAttachmentComponent } from './attachment/owner-attachment.component';

@NgModule({
    declarations: [OwnerComponent, OwnerCreateComponent, OwnerUpdateComponent, OwnerAttachmentComponent],
    imports: [CommonModule, OwnerRoutingModule, NgxFormModule, AttachmentComponent, ListModule, PageModule],
})
export class OwnerModule {}
