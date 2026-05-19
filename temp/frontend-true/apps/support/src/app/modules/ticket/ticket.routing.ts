import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { SupportTicketResolver } from '../../resolvers';

import { TicketComponent } from './ticket.component';
import { TicketInfoComponent } from './info/ticket-info.component';

const routes: Routes = [
    { path: '', component: TicketComponent },
    {
        path: ':ticketId',
        data: { header: 'مشاهده درخواست' },
        resolve: { ticket: SupportTicketResolver },
        component: TicketInfoComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class TicketRoutingModule {}
