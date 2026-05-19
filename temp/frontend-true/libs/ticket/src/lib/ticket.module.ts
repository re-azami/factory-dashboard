import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TicketRoutingModule } from './ticket.routing';
import { TicketComponent } from './ticket.component';
import { TicketCreateComponent } from './create/ticket-create.component';
import { TicketInfoComponent } from './info/ticket-info.component';

import { TicketReplyFormComponent } from './reply/form/ticket-reply-form.component';
import { TicketReplyViewComponent } from './reply/view/ticket-reply-view.component';

import { TicketAttachmentFormComponent } from './attachment/form/ticket-attachment-form.component';
import { TicketAttachmentViewComponent } from './attachment/view/ticket-attachment-view.component';

import { TicketService } from './ticket.service';

@NgModule({
    declarations: [
        TicketComponent,
        TicketCreateComponent,
        TicketInfoComponent,

        TicketReplyFormComponent,
        TicketReplyViewComponent,

        TicketAttachmentFormComponent,
        TicketAttachmentViewComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        TicketRoutingModule,

        NgxFormModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
    providers: [TicketService],
})
export class TicketModule {}
