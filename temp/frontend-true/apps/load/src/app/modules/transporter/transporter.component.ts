import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadTransporterDeleteRs,
    ILoadTransporterDTO,
    ILoadTransporterListRs,
    ILoadTransporterStatusRq,
    ILoadTransporterStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

import { TransporterCreateComponent } from './create/transporter-create.component';
import { TransporterUpdateComponent } from './update/transporter-update.component';

@Component({
    host: { selector: 'transporter' },
    templateUrl: './transporter.component.html',
    styleUrl: './transporter.component.scss',
    standalone: false
})
export class TransporterComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت باربری‌ها',
        toolbar: {
            route: ['/transporter'],
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
        actions: [{ type: 'CREATE', title: 'باربری جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public transporters: ILoadTransporterDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadTransporterDTO> = {
        type: 'محوله',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'کد باربری', value: 'code', english: true },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            {
                title: 'فایل‌های ضمیمه',
                icon: 'attach_file',
                action: (data: ILoadTransporterDTO) => ['/transporter', 'attachment', data.id],
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadTransporterDTO) => ['/report', 'transporter', data.id],
                access: { access: 'LOAD_REPORT_TRANSPORTER' },
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
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadTransporterListRs>(
            'LoadTransporterList',
            { params: { status, query, page } },
            (response) => {
                this.loading = false;
                this.transporters = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(TransporterCreateComponent, 'ثبت باربری جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('باربری با موفقیت ثبت شد.');
        });
    }

    update(transporter: ILoadTransporterDTO): void {
        this.ngxHelperBottomSheetService.open(TransporterUpdateComponent, 'ویرایش باربری', { data: { transporter } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('باربری با موفقیت ویرایش شد.');
        });
    }

    delete(transporter: ILoadTransporterDTO): void {
        const item: string = 'باربری';
        const title: string = transporter.title;
        const message: string =
            'در صورت تایید، اطلاعات بارهای مربوط به باربری در سیستم باقی خواهد ماند و فقط مشخصات باربری حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = transporter.id;
            this.apiService.request<ILoadTransporterDeleteRs>('LoadTransporterDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('باربری با موفقیت حذف شد.');
            });
        });
    }

    status(transporter: ILoadTransporterDTO, active: boolean): void {
        const item: string = 'باربری';
        const title: string = transporter.title;
        const message: string = active
            ? 'پس از فعال کردن باربری، امکان ثبت به عنوان باربری بار فعال می‌شود.'
            : 'در صورت تایید، اطلاعات باربری در سیستم باقی خواهد ماند اما امکان ثبت به عنوان باربری بار غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = transporter.id;
            const body: ILoadTransporterStatusRq = { active };
            this.apiService.request<ILoadTransporterStatusRs>('LoadTransporterStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`محموله با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(transporter: ILoadTransporterDTO): void {
        this.loadToolsService.logData('TRANSPORTER', transporter.id);
    }
}
