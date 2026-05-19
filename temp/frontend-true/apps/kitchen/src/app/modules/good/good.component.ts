import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    IKitchenGoodDeleteRs,
    IKitchenGoodDTO,
    IKitchenGoodListRs,
    IKitchenGoodStatusRq,
    IKitchenGoodStatusRs,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { KitchenGood, KitchenGoodInfo, KitchenGoodList, KitchenInventoryInfo, KitchenUnitInfo } from '@lib/shared';

import { KitchenInventoryService, KitchenUnitService } from '../../providers';

import { GoodCreateComponent } from './create/good-create.component';
import { GoodUpdateComponent } from './update/good-update.component';

@Component({
    host: { selector: 'good' },
    standalone: false,
    templateUrl: './good.component.html',
    styleUrl: './good.component.scss',
})
export class GoodComponent {
    public groups: IOptionDTO[] = this.activatedRoute.snapshot.data['groups'];

    private goodAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_GOOD' });
    private inventoryAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_INVENTORY' });

    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت کالاها',
        toolbar: {
            route: ['/good'],
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
                    name: 'good',
                    type: 'SELECT',
                    title: 'نوع کالا',
                    options: KitchenGoodList.map((g) => ({ id: g, title: KitchenGoodInfo[g].title })),
                },
                { name: 'group', type: 'SELECT', title: 'گروه کالا', options: this.groups },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [
            {
                type: 'MENU',
                title: 'کالای جدید',
                icon: 'add',
                color: 'primary',
                action: (id: string) => this.create(id as KitchenGood),
                menu: KitchenGoodList.map((g) => ({
                    id: g,
                    title: KitchenGoodInfo[g].title,
                    description: KitchenGoodInfo[g].description,
                })),
                hideOn: () => !this.goodAccess,
            },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public goods: IKitchenGoodDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IKitchenGoodDTO> = {
        type: 'کالا',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/good', data.id] },
            { title: 'نوع کالا', value: (data) => KitchenGoodInfo[data.good].title, isDescription: true },
            { title: 'گروه', value: (data) => data.group?.title },
            { title: 'واحد محاسبات', value: (data) => KitchenUnitInfo[data.unit].title },
            {
                title: 'موجودی',
                value: (data) => this.kitchenUnitService.valueTitle(data.unit, data.inventory),
                color: (data) => this.kitchenUnitService.valueColor(data.inventory),
            },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            {
                title: 'تغییر موجودی اولیه',
                icon: 'warehouse',
                action: (data: IKitchenGoodDTO) =>
                    this.kitchenInventoryService.inventoryInitial(data, () => this.loadList()),
                hideOn: (data: IKitchenGoodDTO) => data.status === 'DEACTIVE' || !this.inventoryAccess,
            },
            'DIVIDER',
            {
                title: KitchenInventoryInfo.ENTER.title,
                icon: KitchenInventoryInfo.ENTER.icon,
                action: (data: IKitchenGoodDTO) =>
                    this.kitchenInventoryService.inventoryCreate('ENTER', data, () => this.loadList()),
                hideOn: (data: IKitchenGoodDTO) => data.status === 'DEACTIVE' || !this.inventoryAccess,
            },
            {
                title: KitchenInventoryInfo.EXIT.title,
                icon: KitchenInventoryInfo.EXIT.icon,
                action: (data: IKitchenGoodDTO) =>
                    this.kitchenInventoryService.inventoryCreate('EXIT', data, () => this.loadList()),
                hideOn: (data: IKitchenGoodDTO) => data.status === 'DEACTIVE' || !this.inventoryAccess,
            },
            {
                title: KitchenInventoryInfo.RESET.title,
                icon: KitchenInventoryInfo.RESET.icon,
                action: (data: IKitchenGoodDTO) =>
                    this.kitchenInventoryService.inventoryCreate('RESET', data, () => this.loadList()),
                hideOn: (data: IKitchenGoodDTO) => data.status === 'DEACTIVE' || !this.inventoryAccess,
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this), hideOn: () => !this.goodAccess },
            {
                type: 'STATUS',
                action: this.status.bind(this),
                isActive: (data) => data.status === 'ACTIVE',
                hideOn: () => !this.goodAccess,
            },
            { type: 'DELETE', action: this.delete.bind(this), hideOn: () => !this.goodAccess },
            'DIVIDER',
            { title: 'گزارش تغییرات', icon: 'assessment', action: (data: IKitchenGoodDTO) => ['/good', data.id] },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly kitchenInventoryService: KitchenInventoryService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const good: string = this.params?.params?.['good']?.param || '';
        const group: string = this.params?.params?.['group']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IKitchenGoodListRs>(
            'KitchenGoodList',
            { params: { status, good, group, query, page } },
            (response) => {
                this.loading = false;
                this.goods = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(good: KitchenGood): void {
        this.ngxHelperBottomSheetService.open(
            GoodCreateComponent,
            'ثبت کالای جدید',
            { data: { good, groups: this.groups } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('کالا با موفقیت ثبت شد.');
            },
        );
    }

    update(good: IKitchenGoodDTO): void {
        this.ngxHelperBottomSheetService.open(
            GoodUpdateComponent,
            'ویرایش کالا',
            { data: { good, groups: this.groups } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('کالا با موفقیت ویرایش شد.');
            },
        );
    }

    delete(good: IKitchenGoodDTO): void {
        const item: string = 'کالا';
        const title: string = good.title;
        const message: string =
            'در صورت تایید، اطلاعات مصرف کالا در سیستم باقی خواهد ماند و فقط مشخصات کالا حذف می‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = good.id;
            this.apiService.request<IKitchenGoodDeleteRs>('KitchenGoodDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('کالا با موفقیت حذف شد.');
            });
        });
    }

    status(good: IKitchenGoodDTO, active: boolean): void {
        const item: string = 'کالا';
        const title: string = good.title;
        const message: string = active
            ? 'پس از فعال کردن کالا، امکان ثبت مصرف فعال می‌شود.'
            : 'در صورت تایید، اطلاعات کالا در سیستم باقی خواهد ماند اما امکان ثبت مصرف غیرفعال می‌شود.';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = good.id;
            const body: IKitchenGoodStatusRq = { active };
            this.apiService.request<IKitchenGoodStatusRs>('KitchenGoodStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`کالا با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }
}
