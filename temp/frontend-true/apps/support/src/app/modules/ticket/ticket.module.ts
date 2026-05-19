import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TicketRoutingModule } from './ticket.routing';
import { TicketComponent } from './ticket.component';
import { TicketInfoComponent } from './info/ticket-info.component';

import { TicketReplyFormComponent } from './reply/form/ticket-reply-form.component';
import { TicketReplyViewComponent } from './reply/view/ticket-reply-view.component';

import { TicketAttachmentFormComponent } from './attachment/form/ticket-attachment-form.component';
import { TicketAttachmentViewComponent } from './attachment/view/ticket-attachment-view.component';

@NgModule({
    declarations: [
        TicketComponent,
        TicketInfoComponent,

        TicketReplyFormComponent,
        TicketReplyViewComponent,

        TicketAttachmentFormComponent,
        TicketAttachmentViewComponent,
    ],
    imports: [CommonModule, TicketRoutingModule, NgxFormModule, NgxHelperPipeModule, ListModule, MaterialModule, PageModule],
})
export class TicketModule {}
