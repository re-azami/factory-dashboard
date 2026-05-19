import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILoadShipmentDeleteRs,
    ILoadShipmentDTO,
    ILoadShipmentListRs,
    ILoadShipmentStatusRq,
    ILoadShipmentStatusRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../providers';

import { ShipmentCreateComponent } from './create/shipment-create.component';
import { ShipmentUpdateComponent } from './update/shipment-update.component';

@Component({
    host: { selector: 'shipment' },
    templateUrl: './shipment.component.html',
    styleUrl: './shipment.component.scss',
    standalone: false
})
export class ShipmentComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت محموله‌ها',
        toolbar: {
            route: ['/shipment'],
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
        actions: [{ type: 'CREATE', title: 'محموله جدید', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public shipments: ILoadShipmentDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadShipmentDTO> = {
        type: 'محوله',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadShipmentDTO) => ['/report', 'shipment', data.id],
                access: { access: 'LOAD_REPORT_SHIPMENT' },
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
        this.apiService.request<ILoadShipmentListRs>('LoadShipmentList', { params: { status, query, page } }, (response) => {
            this.loading = false;
            this.shipments = response.list;
            this.pagination = response.pagination;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(ShipmentCreateComponent, 'ثبت محموله جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('محموله با موفقیت ثبت شد.');
        });
    }

    update(shipment: ILoadShipmentDTO): void {
        this.ngxHelperBottomSheetService.open(ShipmentUpdateComponent, 'ویرایش محموله', { data: { shipment } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('محموله با موفقیت ویرایش شد.');
        });
    }

    delete(shipment: ILoadShipmentDTO): void {
        const item: string = 'محموله';
        const title: string = shipment.title;
        const message: string =
            'در صورت تایید، اطلاعات بارهای مربوط به محموله در سیستم باقی خواهد ماند و فقط مشخصات محموله حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = shipment.id;
            this.apiService.request<ILoadShipmentDeleteRs>('LoadShipmentDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('محموله با موفقیت حذف شد.');
            });
        });
    }

    status(shipment: ILoadShipmentDTO, active: boolean): void {
        const item: string = 'محموله';
        const title: string = shipment.title;
        const message: string = active
            ? 'پس از فعال کردن محموله، امکان ثبت به عنوان محموله بار فعال می‌شود.'
            : 'در صورت تایید، اطلاعات محموله در سیستم باقی خواهد ماند اما امکان ثبت به عنوان محموله بار غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = shipment.id;
            const body: ILoadShipmentStatusRq = { active };
            this.apiService.request<ILoadShipmentStatusRs>('LoadShipmentStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`محموله با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    log(shipment: ILoadShipmentDTO): void {
        this.loadToolsService.logData('SHIPMENT', shipment.id);
    }
}
