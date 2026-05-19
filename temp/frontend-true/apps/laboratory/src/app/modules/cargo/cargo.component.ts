import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILaboratoryCargoDeleteRs,
    ILaboratoryCargoDTO,
    ILaboratoryCargoListRs,
    ILaboratoryCargoShareRq,
    ILaboratoryCargoShareRs,
    ILaboratoryCargoStatusRq,
    ILaboratoryCargoStatusRs,
    IPaginationDTO,
    ISharedLoadCargoDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LoadCargo, LoadCargoInfo, SharedService } from '@lib/shared';

import { LaboratoryCargoService } from '../../providers';

import { CargoCreateComponent } from './create/cargo-create.component';
import { CargoUpdateComponent } from './update/cargo-update.component';
import { CargoMoveComponent } from './move/cargo-move.component';

@Component({
    host: { selector: 'cargo' },
    templateUrl: './cargo.component.html',
    styleUrl: './cargo.component.scss',
    standalone: false
})
export class CargoComponent {
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
                    options: [
                        { title: 'فعال', value: 'ACTIVE', icon: 'check_circle' },
                        { title: 'غیرفعال', value: 'DEACTIVE', icon: 'cancel' },
                    ],
                },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [
            {
                type: 'MENU',
                title: 'بار جدید',
                icon: 'add',
                color: 'primary',
                menu: [
                    {
                        id: 'CREATE',
                        title: 'ثبت بار جدید',
                        description: 'ثبت عنوان بارهایی که در لیست بارهای ثبت شده در سیستم مدیریت بار وجود ندارند',
                    },
                    {
                        id: 'SHARE',
                        title: 'انتخاب بار',
                        description: 'اضافه کردن بار ثبت شده در لیست بارهای سیستم مدیریت بار به لیست بارهای آزمایشگاه',
                    },
                    {
                        id: 'MIXED',
                        title: 'بار مخلوط',
                        description: 'ثبت بار جدید به صورت مخلوط از دو یا چند بار ثبت شده در سیستم مدیریت بار',
                    },
                ],
                action: (id: string) => {
                    switch (id) {
                        case 'CREATE':
                            this.create();
                            break;
                        case 'SHARE':
                            this.share();
                            break;
                        case 'MIXED':
                            return ['/cargo', 'mixed'];
                    }

                    return;
                },
            },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public cargos: ILaboratoryCargoDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryCargoDTO> = {
        type: 'بار',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        description: (data) => data.description,
        columns: [
            {
                title: 'عنوان',
                value: 'title',
                description: (data) => (data.type ? LoadCargoInfo[data.type].title : undefined),
                english: (data) => data.portions.length > 0,
                action: (data) =>
                    data.portions.length > 0 ? () => this.laboratoryCargoService.showMixed(data.title, data.portions) : [],
            },
            { title: 'طرف حساب', value: (data) => data.party?.title },
            { title: 'محموله', value: (data) => data.shipment?.title },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { title: 'انتقال آزمایش‌ها', icon: 'biotech', action: this.move.bind(this), access: { group: 'MANAGER' } },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this), hideOn: (data) => data.isShared },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryCargoService: LaboratoryCargoService,
        private readonly sharedService: SharedService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryCargoListRs>(
            'LaboratoryCargoList',
            { params: { status, query, page } },
            (response) => {
                this.loading = false;
                this.cargos = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(CargoCreateComponent, 'ثبت بار جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('بار با موفقیت ثبت شد.');
        });
    }

    share(): void {
        this.sharedService.getLoadCargo().then((cargo: ISharedLoadCargoDTO) => {
            const types: LoadCargo[] = ['BUY', 'IN', 'OUT'];
            if (!types.includes(cargo.type)) {
                this.ngxHelperToastService.error('امکان ثبت بارهای داخلی به عنوان بار جدید وجود ندارد.');
                return;
            }

            const body: ILaboratoryCargoShareRq = { cargo: cargo.id };
            this.apiService.request<ILaboratoryCargoShareRs>('LaboratoryCargoShare', { body }, () => {
                this.loadList();
                this.ngxHelperToastService.success('بار با موفقیت ثبت شد.');
            });
        });
    }

    move(cargo: ILaboratoryCargoDTO): void {
        this.ngxHelperBottomSheetService.open<{ delete: boolean }>(
            CargoMoveComponent,
            'انتقال آزمایش‌های بار',
            { data: { cargo } },
            (response) => {
                this.loadList();
                this.ngxHelperToastService.success('آزمایش‌های مرتبط با بار با موفقیت منتقل شد.');
                if (response.delete) this.delete(cargo);
            },
        );
    }

    update(cargo: ILaboratoryCargoDTO): void {
        if (cargo.isShared) return;

        if (cargo.portions.length > 0) this.router.navigate(['/cargo', 'mixed', cargo.id]);
        else
            this.ngxHelperBottomSheetService.open(CargoUpdateComponent, 'ویرایش بار', { data: { cargo } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('بار با موفقیت ویرایش شد.');
            });
    }

    delete(cargo: ILaboratoryCargoDTO): void {
        const item: string = 'بار';
        const title: string = cargo.title;
        const message: string =
            'در صورت تایید، اطلاعات آزمایش‌های مربوط به بار در سیستم باقی خواهد ماند و فقط مشخصات بار حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = cargo.id;
            this.apiService.request<ILaboratoryCargoDeleteRs>('LaboratoryCargoDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('بار با موفقیت حذف شد.');
            });
        });
    }

    status(cargo: ILaboratoryCargoDTO, active: boolean): void {
        const item: string = 'بار';
        const title: string = cargo.title;
        const message: string = active
            ? 'پس از فعال کردن بار، امکان ثبت آزمایش مرتبط با بار فعال می‌شود.'
            : 'در صورت تایید، اطلاعات بار در سیستم باقی خواهد ماند اما امکان ثبت آزمایش مرتبط با بار غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = cargo.id;
            const body: ILaboratoryCargoStatusRq = { active };
            this.apiService.request<ILaboratoryCargoStatusRs>('LaboratoryCargoStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`بار با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }
}
