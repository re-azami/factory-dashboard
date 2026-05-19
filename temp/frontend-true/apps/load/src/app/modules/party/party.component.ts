import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadPartyDTO,
    ILoadPartyDeleteRs,
    ILoadPartyListRs,
    ILoadPartyStatusRq,
    ILoadPartyStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo, LoadCargoList } from '@lib/shared';

import { LoadToolsService } from '../../providers';

import { PartyCreateComponent } from './create/party-create.component';
import { PartyUpdateComponent } from './update/party-update.component';

@Component({
    host: { selector: 'party' },
    templateUrl: './party.component.html',
    styleUrl: './party.component.scss',
    standalone: false
})
export class PartyComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت طرف حساب‌ها',
        toolbar: {
            route: ['/party'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: [
                        { title: 'فعال', value: 'ACTIVE', icon: 'check_circle' },
                        { title: 'غیرفعال', value: 'DEACTIVE', icon: 'cancel' },
                    ],
                },
                {
                    name: 'cargo',
                    type: 'SELECT',
                    title: 'نوع بار',
                    options: LoadCargoList.map((c) => ({ id: c, title: LoadCargoInfo[c].title })),
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [{ type: 'CREATE', title: 'طرف حساب‌ جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public parties: ILoadPartyDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadPartyDTO> = {
        type: 'طرف حساب',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'نوع بار', value: (data) => data.cargo.map((c) => LoadCargoInfo[c].title).join('، ') },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            {
                title: 'فایل‌های ضمیمه',
                icon: 'attach_file',
                action: (data: ILoadPartyDTO) => ['/party', 'attachment', data.id],
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadPartyDTO) => ['/report', 'party', data.id],
                access: { access: 'LOAD_REPORT_PARTY' },
            },
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LOAD_DATA_LOG' } },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,

        private readonly loadToolsService: LoadToolsService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const cargo: string = this.params?.params?.['cargo']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadPartyListRs>(
            'LoadPartyList',
            { params: { status, cargo, query, page } },
            (response) => {
                this.loading = false;
                this.parties = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(PartyCreateComponent, 'ثبت طرف حساب جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('طرف حساب با موفقیت ثبت شد.');
        });
    }

    update(party: ILoadPartyDTO): void {
        this.ngxHelperBottomSheetService.open(PartyUpdateComponent, 'ویرایش طرف حساب', { data: { party } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('طرف حساب با موفقیت ویرایش شد.');
        });
    }

    delete(party: ILoadPartyDTO): void {
        const item: string = 'طرف حساب';
        const title: string = party.title;
        const message: string =
            'در صورت تایید، اطلاعات حواله‌های مربوط به طرف حساب در سیستم باقی خواهد ماند و فقط مشخصات طرف حساب حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = party.id;
            this.apiService.request<ILoadPartyDeleteRs>('LoadPartyDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('طرف حساب با موفقیت حذف شد.');
            });
        });
    }

    status(party: ILoadPartyDTO, active: boolean): void {
        const item: string = 'طرف حساب';
        const title: string = party.title;
        const message: string = active
            ? 'پس از فعال کردن طرف حساب، امکان ثبت بار مرتبط با طرف حساب فعال می‌شود.'
            : 'در صورت تایید، اطلاعات طرف حساب در سیستم باقی خواهد ماند اما امکان ثبت بار مرتبط با طرف حساب غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = party.id;
            const body: ILoadPartyStatusRq = { active };
            this.apiService.request<ILoadPartyStatusRs>('LoadPartyStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`طرف حساب با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(party: ILoadPartyDTO): void {
        this.loadToolsService.logData('PARTY', party.id);
    }
}
