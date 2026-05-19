import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISupportTicketDTO } from '@lib/apis';
import { AppInfo, SupportRequestInfo, SupportTicketInfo } from '@lib/shared';

import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'ticket-info' },
    templateUrl: './ticket-info.component.html',
    styleUrl: './ticket-info.component.scss',
    standalone: false
})
export class TicketInfoComponent {
    public appInfo = AppInfo;
    public supportTicketInfo = SupportTicketInfo;
    public supportRequestInfo = SupportRequestInfo;

    public ticket: ISupportTicketDTO = this.activatedRoute.snapshot.data['ticket'];
    public title: IPageTitle = {
        title: 'درخواست پشتیبانی',
        actions: [{ type: 'RETURN', action: ['/ticket'] }],
    };

    constructor(private readonly activatedRoute: ActivatedRoute) {}
}
