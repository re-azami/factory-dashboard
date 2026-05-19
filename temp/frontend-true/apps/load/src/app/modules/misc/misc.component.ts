import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadMiscDeleteRs,
    ILoadMiscDTO,
    ILoadMiscListRs,
    ILoadMiscStatusRq,
    ILoadMiscStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

import { MiscCreateComponent } from './create/misc-create.component';
import { MiscUpdateComponent } from './update/misc-update.component';

@Component({
    host: { selector: 'misc' },
    templateUrl: './misc.component.html',
    styleUrl: './misc.component.scss',
    standalone: false
})
export class MiscComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت محموله‌های متفرقه',
        toolbar: {
            route: ['/misc'],
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
        actions: [{ type: 'CREATE', title: 'محموله متفرقه جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public miscs: ILoadMiscDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadMiscDTO> = {
        type: 'محوله متفرقه',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'واحد', value: 'unit' },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
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
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadMiscListRs>('LoadMiscList', { params: { status, query, page } }, (response) => {
            this.loading = false;
            this.miscs = response.list;
            this.pagination = response.pagination;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(MiscCreateComponent, 'ثبت محموله متفرقه جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('محموله متفرقه با موفقیت ثبت شد.');
        });
    }

    update(misc: ILoadMiscDTO): void {
        this.ngxHelperBottomSheetService.open(MiscUpdateComponent, 'ویرایش محموله متفرقه', { data: { misc } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('محموله متفرقه با موفقیت ویرایش شد.');
        });
    }

    delete(misc: ILoadMiscDTO): void {
        const item: string = 'محموله متفرقه';
        const title: string = misc.title;
        const message: string =
            'در صورت تایید، اطلاعات بارهای مربوط به محموله در سیستم باقی خواهد ماند و فقط مشخصات محموله حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = misc.id;
            this.apiService.request<ILoadMiscDeleteRs>('LoadMiscDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('محموله متفرقه با موفقیت حذف شد.');
            });
        });
    }

    status(misc: ILoadMiscDTO, active: boolean): void {
        const item: string = 'محموله متفرقه';
        const title: string = misc.title;
        const message: string = active
            ? 'پس از فعال کردن محموله، امکان ثبت به عنوان محموله بار فعال می‌شود.'
            : 'در صورت تایید، اطلاعات محموله در سیستم باقی خواهد ماند اما امکان ثبت به عنوان محموله بار غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = misc.id;
            const body: ILoadMiscStatusRq = { active };
            this.apiService.request<ILoadMiscStatusRs>('LoadMiscStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`محموله متفرقه با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(misc: ILoadMiscDTO): void {
        this.loadToolsService.logData('MISC', misc.id);
    }
}
