import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadCargoDeleteRs, ILoadCargoDTO, ILoadCargoListRs, IOptionDTO, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargoInfo, LoadCargoList, LoadStatus, LoadStatusInfo, LoadStatusList } from '@lib/shared';

import { LoadToolsService } from '../../providers';

import { CargoStatusComponent } from './status/cargo-status.component';

@Component({
    host: { selector: 'cargo' },
    templateUrl: './cargo.component.html',
    styleUrl: './cargo.component.scss',
    standalone: false
})
export class CargoComponent {
    public parties: IOptionDTO[] = this.activatedRoute.snapshot.data['parties'];
    public shipments: IOptionDTO[] = this.activatedRoute.snapshot.data['shipments'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت بارها',
        toolbar: {
            route: ['/cargo'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    icon: 'task_alt',
                    options: LoadStatusList.map((status: LoadStatus) => ({
                        value: status,
                        title: LoadStatusInfo[status].title,
                    })),
                },
                {
                    name: 'cargo',
                    type: 'SELECT',
                    title: 'نوع بار',
                    options: LoadCargoList.map((c) => ({ id: c, title: LoadCargoInfo[c].title })),
                },
                { name: 'party', type: 'SELECT', title: 'طرف حساب', options: this.parties },
                { name: 'shipment', type: 'SELECT', title: 'محموله', options: this.shipments },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [
            {
                type: 'MENU',
                title: 'بار جدید',
                icon: 'add',
                color: 'primary',
                action: (id: string) => ['/cargo', 'create', id],
                menu: LoadCargoList.map((c) => ({
                    id: c,
                    title: LoadCargoInfo[c].title,
                    description: LoadCargoInfo[c].description,
                })),
            },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public cargos: ILoadCargoDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadCargoDTO> = {
        type: 'بار',
        description: (data) => (data.prior ? `فعال سازی اتوماتیک: ${data.prior.title}` : ''),
        isDeactive: (data) => data.status === 'DONE',
        icon: (data) => LoadStatusInfo[data.status].icon,
        columns: [
            {
                title: 'عنوان',
                value: 'title',
                action: (data) => ['/cargo', 'info', data.type, data.id],
                color: (data) => LoadStatusInfo[data.status].color,
            },
            { title: 'وضعیت', value: (data) => LoadStatusInfo[data.status].title },
            { title: 'نوع بار', value: (data) => LoadCargoInfo[data.type].title, isDescription: true },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { title: 'طرف حساب', value: (data) => data.party?.title || '' },
            { title: 'محموله', value: (data) => data.shipment?.title || '' },
            { title: 'عیار', value: 'grade', type: 'NUMBER' },
            { title: 'تناژ', value: 'tonnage', type: 'NUMBER' },
            { title: 'هزینه حمل', value: (data) => (data.payment ? data.price : undefined), type: 'NUMBER' },
        ],
        actions: [
            {
                title: 'ناوگان اختصاصی',
                icon: 'local_shipping',
                action: (data: ILoadCargoDTO) => ['/cargo', 'truck', data.id],
            },
            {
                title: 'گروه‌های حواله‌های بار',
                icon: 'assignment',
                action: (data: ILoadCargoDTO) => ['/cargo', 'group', data.id],
                hideOn: (data) => data.type !== 'SITE',
            },
            {
                title: 'فایل‌های ضمیمه',
                icon: 'attach_file',
                action: (data: ILoadCargoDTO) => ['/cargo', 'attachment', data.id],
            },
            'DIVIDER',
            { title: 'تغییر وضعیت بار', icon: 'task_alt', action: this.status.bind(this) },
            { type: 'UPDATE', action: (data) => ['/cargo', 'update', data.type, data.id] },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            {
                title: 'گزارش حواله‌ها',
                icon: 'assignment',
                action: (data: ILoadCargoDTO) => ['/report', 'cargo', data.id],
                access: { access: 'LOAD_REPORT_CARGO' },
            },
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LOAD_DATA_LOG' } },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
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
        const party: string = this.params?.params?.['party']?.param || '';
        const shipment: string = this.params?.params?.['shipment']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadCargoListRs>(
            'LoadCargoList',
            { params: { status, cargo, party, shipment, query, page } },
            (response) => {
                this.loading = false;
                this.cargos = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    delete(cargo: ILoadCargoDTO): void {
        const item: string = 'بار';
        const title: string = cargo.title;
        const message: string =
            'در صورت تایید، اطلاعات بار به صورت کامل از سیستم حذف شده و امکان بازیابی اطلاعات حذف شده وجود ندارد. ' +
            'در صورتی که حواله مرتبط با بار در سیستم ثبت شده باشد، امکان حذف بار وجود نخواهد داشت.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = cargo.id;
            this.apiService.request<ILoadCargoDeleteRs>('LoadCargoDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('بار با موفقیت حذف شد.');
            });
        });
    }

    status(cargo: ILoadCargoDTO): void {
        this.ngxHelperBottomSheetService.open(CargoStatusComponent, 'تغییر وضعیت بار', { data: { cargo } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('وضعیت بار با موفقیت ثبت شد.');
        });
    }

    log(cargo: ILoadCargoDTO): void {
        this.loadToolsService.logData('CARGO', cargo.id);
    }
}
