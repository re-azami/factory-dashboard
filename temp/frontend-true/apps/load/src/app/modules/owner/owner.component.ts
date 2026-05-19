import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadOwnerDeleteRs,
    ILoadOwnerDTO,
    ILoadOwnerListRs,
    ILoadOwnerStatusRq,
    ILoadOwnerStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

@Component({
    host: { selector: 'owner' },
    templateUrl: './owner.component.html',
    styleUrl: './owner.component.scss',
    standalone: false
})
export class OwnerComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت مالک‌ها',
        toolbar: {
            route: ['/owner'],
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
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [{ type: 'CREATE', title: 'مالک جدید', action: ['/owner', 'create'] }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public owners: ILoadOwnerDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadOwnerDTO> = {
        type: 'مالک',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: (data) => `${data.name.first} ${data.name.last}` },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { value: 'mobile', type: 'MOBILE', copy: (data) => data.mobile },
            { value: 'nationalCode', type: 'NATIONAL-CODE', copy: (data) => data.nationalCode },
            { title: 'شبا', value: (data) => data.account.sheba, copy: (data) => data.account.sheba, english: true },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            {
                icon: 'local_shipping',
                title: 'مدیریت ناوگان',
                action: (data: ILoadOwnerDTO) => {
                    this.router.navigate(['/truck'], { queryParams: { owner: data.id } });
                },
                access: { access: 'LOAD_TRUCK' },
                hideOn: (data) => data.status === 'DEACTIVE',
            },
            {
                title: 'فایل‌های ضمیمه',
                icon: 'attach_file',
                action: (data: ILoadOwnerDTO) => ['/owner', 'attachment', data.id],
            },
            'DIVIDER',
            { type: 'UPDATE', action: (data) => ['/owner', 'update', data.id] },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadOwnerDTO) => ['/report', 'owner', data.id],
                access: { access: 'LOAD_REPORT_OWNER' },
            },
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LOAD_DATA_LOG' } },
        ],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadOwnerListRs>('LoadOwnerList', { params: { status, query, page } }, (response) => {
            this.loading = false;
            this.owners = response.list;
            this.pagination = response.pagination;
        });
    }

    delete(owner: ILoadOwnerDTO): void {
        const item: string = 'مالک';
        const title: string = `${owner.name.first} ${owner.name.last}`;
        const message: string =
            'در صورت تایید، اطلاعات حواله‌های مربوط به مالک در سیستم باقی خواهد ماند اما اطلاعات مالک و ناوگان مرتبط از سیستم حذف می‌شوند. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = owner.id;
            this.apiService.request<ILoadOwnerDeleteRs>('LoadOwnerDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('مالک با موفقیت حذف شد.');
            });
        });
    }

    status(owner: ILoadOwnerDTO, active: boolean): void {
        const item: string = 'مالک';
        const title: string = `${owner.name.first} ${owner.name.last}`;
        const message: string = active
            ? 'پس از فعال کردن مالک، امکان ثبت بار برای ناوگان مرتبط با مالک فعال می‌شود.'
            : 'در صورت تایید، اطلاعات مالک و ناوگان مرتبط در سیستم باقی خواهد ماند اما امکان ثبت بار برای ناوگان مرتبط غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = owner.id;
            const body: ILoadOwnerStatusRq = { active };
            this.apiService.request<ILoadOwnerStatusRs>('LoadOwnerStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`مالک با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(owner: ILoadOwnerDTO): void {
        this.loadToolsService.logData('OWNER', owner.id);
    }
}
