import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ISupportTicketDTO, ISupportTicketUserDeleteRs, ISupportTicketUserInfoRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { App, SupportRequestInfo, SupportTicketInfo } from '@lib/shared';

import { TicketService } from '../ticket.service';

@Component({
    host: { selector: 'ticket-info' },
    templateUrl: './ticket-info.component.html',
    styleUrl: './ticket-info.component.scss',
    standalone: false
})
export class TicketInfoComponent implements OnInit {
    public supportTicketInfo = SupportTicketInfo;
    public supportRequestInfo = SupportRequestInfo;

    private id: string = this.activatedRoute.snapshot.params['ticketId'];

    public title: IPageTitle = {
        title: 'درخواست‌های پشتیبانی',
        actions: [
            { type: 'DELETE', title: 'حذف درخواست', action: this.delete.bind(this) },
            { type: 'RETURN', action: ['/ticket'] },
        ],
    };

    public app?: App;
    public ticket?: ISupportTicketDTO;

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly ticketService: TicketService,
    ) {}

    ngOnInit(): void {
        if (!this.id) {
            this.router.navigate(['/ticket']);
            return;
        }

        this.app = this.ticketService.app;
        if (!this.app) return;

        const app: App = this.app;
        const ID: string = this.id;
        this.apiService.request<ISupportTicketUserInfoRs>(
            'SupportTicketUserInfo',
            { ids: { ID }, params: { app } },
            (response) => (this.ticket = response),
            () => this.router.navigate(['/ticket']),
        );
    }

    delete(): void {
        if (!this.ticket) return;

        const item: string = 'درخواست پشتیبانی';
        const title: string = this.ticket.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            if (!this.ticket || !this.app) return;

            const ID: string = this.ticket.id;
            this.apiService.request<ISupportTicketUserDeleteRs>(
                'SupportTicketUserDelete',
                { ids: { ID }, params: { app: this.app } },
                () => {
                    this.ngxHelperToastService.success('درخواست پشتیبانی با موفقیت حذف شد.');
                    this.router.navigate(['/ticket']);
                },
            );
        });
    }
}
