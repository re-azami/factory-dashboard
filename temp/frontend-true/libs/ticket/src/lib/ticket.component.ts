import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IPaginationDTO,
    ISupportTicketListDTO,
    ISupportTicketUserDeleteRs,
    ISupportTicketUserListRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { App, SupportTicketInfo } from '@lib/shared';

import { TicketService } from './ticket.service';
import { TicketCreateComponent } from './create/ticket-create.component';

@Component({
    host: { selector: 'ticket' },
    templateUrl: './ticket.component.html',
    styleUrl: './ticket.component.scss',
    standalone: false
})
export class TicketComponent {
    public app!: App;

    public page: number = 1;
    public title: IPageTitle = {
        title: 'درخواست‌های پشتیبانی',
        toolbar: { route: ['ticket'] },
        actions: [{ type: 'CREATE', title: 'درخواست جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public tickets: ISupportTicketListDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ISupportTicketListDTO> = {
        type: 'درخواست پشتیبانی',
        icon: (data) => ({ icon: SupportTicketInfo[data.status].icon, color: SupportTicketInfo[data.status].color }),
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/ticket', data.id] },
            { title: 'ثبت', value: (data) => data.date.create, type: 'DATE' },
            { title: 'وضعیت', value: (data) => SupportTicketInfo[data.status].title },
        ],
        actions: [{ type: 'DELETE', action: this.delete.bind(this) }],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly ticketService: TicketService,
    ) {}

    ngOnInit(): void {
        const app = this.ticketService.app;
        if (!app) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.app = app;
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const app: App = this.app;
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ISupportTicketUserListRs>('SupportTicketUserList', { params: { app, page } }, (response) => {
            this.loading = false;
            this.tickets = response.list;
            this.pagination = response.pagination;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(
            TicketCreateComponent,
            'ثبت درخواست پشتیبانی',
            { data: { app: this.app } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('درخواست پشتیبانی با موفقیت ثبت شد.');
            },
        );
    }

    delete(ticket: ISupportTicketListDTO): void {
        const item: string = 'درخواست پشتیبانی';
        const title: string = ticket.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = ticket.id;
            this.apiService.request<ISupportTicketUserDeleteRs>(
                'SupportTicketUserDelete',
                { ids: { ID }, params: { app: this.app } },
                () => {
                    this.loadList();
                    this.ngxHelperToastService.success('درخواست پشتیبانی با موفقیت حذف شد.');
                },
            );
        });
    }
}
