import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { INgxHelperValue } from '@webilix/ngx-helper/value';

import {
    ApiService,
    IKitchenGoodDTO,
    IKitchenGoodInventoryRs,
    IKitchenInventoryDeleteRs,
    IKitchenInventoryDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { KitchenGoodInfo, KitchenInventory, KitchenInventoryInfo, KitchenMealInfo, KitchenUnitInfo } from '@lib/shared';

import { KitchenInventoryService, KitchenUnitService } from '../../../providers';

import { InventoryUpdateComponent } from '../../../components/inventory/update/inventory-update.component';

@Component({
    host: { selector: 'good-inventory' },
    standalone: false,
    templateUrl: './good-inventory.component.html',
    styleUrl: './good-inventory.component.scss',
})
export class GoodInventoryComponent implements OnInit {
    public good: IKitchenGoodDTO = this.activatedRoute.snapshot.data['good'];

    public kitchenGoodInfo = KitchenGoodInfo;

    private inventoryAccess: boolean = this.userService.hasAccess({ access: 'KITCHEN_INVENTORY' });

    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت کالاها',
        description: 'گزارش تغییرات موجودی',
        toolbar: { route: ['/good', this.good.id] },
        actions: [
            {
                type: 'MENU',
                title: 'تغییر موجودی',
                icon: 'add',
                color: 'primary',
                action: (id: string) => {
                    if (id === 'INITIAL') this.initial();
                    else this.create(id as KitchenInventory);
                },
                menu: [
                    { id: 'INITIAL', title: 'تغییر موجودی اولیه' },
                    'DIVIDER',
                    { id: 'ENTER', title: KitchenInventoryInfo.ENTER.title },
                    { id: 'EXIT', title: KitchenInventoryInfo.EXIT.title },
                    { id: 'RESET', title: KitchenInventoryInfo.RESET.title },
                ],
                hideOn: () => !this.inventoryAccess || this.good.status === 'DEACTIVE',
            },
            { type: 'RETURN', action: ['/good'] },
        ],
    };

    public values: INgxHelperValue[] = [];

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public inventories: IKitchenInventoryDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IKitchenInventoryDTO> = {
        type: 'تغییر موجودی',
        icon: (data) => ({
            icon: KitchenInventoryInfo[data.type].icon,
            color: KitchenInventoryInfo[data.type].color,
        }),
        description: (data) => data.description,
        columns: [
            { title: 'تاریخ', value: 'date', type: 'DATE' },
            {
                title: 'نوع تغییر',
                value: (data) => KitchenInventoryInfo[data.type].title,
                isDescription: true,
                description: (data) =>
                    data.type === 'SERVING' && data.serving
                        ? `${data.serving.recipe.title} (${KitchenMealInfo[data.serving.meal].title})`
                        : undefined,
            },
            { title: 'مقدار', value: (data) => this.kitchenUnitService.valueTitle(this.good.unit, data.value) },
            {
                title: 'موجودی',
                value: (data) => this.kitchenUnitService.valueTitle(this.good.unit, data.inventory),
                color: (data) => this.kitchenUnitService.valueColor(data.inventory),
            },
        ],
        actions: [
            {
                type: 'UPDATE',
                action: this.update.bind(this),
                hideOn: (data) =>
                    !this.inventoryAccess || this.good.status === 'DEACTIVE' || !KitchenInventoryInfo[data.type].userAction,
            },
            {
                type: 'DELETE',
                action: this.delete.bind(this),
                hideOn: (data) =>
                    !this.inventoryAccess || this.good.status === 'DEACTIVE' || !KitchenInventoryInfo[data.type].userAction,
            },
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

    ngOnInit(): void {
        this.setData();
    }

    setData(): void {
        this.values = [{ title: 'نوع کالا', value: KitchenGoodInfo[this.good.good].title }];
        if (this.good.group) this.values.push({ title: 'گروه', value: this.good.group.title });
        this.values.push(
            { title: 'واحد محاسبات', value: KitchenUnitInfo[this.good.unit].title },
            {
                title: 'موجودی اولیه',
                value: this.good.initial
                    ? this.kitchenUnitService.valueTitle(this.good.unit, this.good.initial)
                    : 'مشخص نشده',
            },
            { title: 'موجودی', value: this.kitchenUnitService.valueTitle(this.good.unit, this.good.inventory) },
        );
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const ID: string = this.good.id;
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IKitchenGoodInventoryRs>(
            'KitchenGoodInventory',
            { ids: { ID }, params: { page } },
            (response) => {
                this.loading = false;
                this.inventories = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    initial(): void {
        this.kitchenInventoryService.inventoryInitial(this.good, (good: IKitchenGoodDTO) => {
            this.good = good;
            this.setData();
            this.loadList();
        });
    }

    create(type: KitchenInventory): void {
        this.kitchenInventoryService.inventoryCreate(type, this.good, (good: IKitchenGoodDTO) => {
            this.good = good;
            this.setData();
            this.loadList();
        });
    }

    update(inventory: IKitchenInventoryDTO): void {
        this.ngxHelperBottomSheetService.open<IKitchenGoodDTO>(
            InventoryUpdateComponent,
            KitchenInventoryInfo[inventory.type].title,
            { data: { good: this.good, inventory } },
            (response) => {
                this.good = response;
                this.setData();
                this.loadList();
            },
        );
    }

    delete(inventory: IKitchenInventoryDTO): void {
        const item: string = KitchenInventoryInfo[inventory.type].title;
        const title: string = this.kitchenUnitService.valueTitle(this.good.unit, inventory.value);
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = inventory.id;
            this.apiService.request<IKitchenInventoryDeleteRs>('KitchenInventoryDelete', { ids: { ID } }, (response) => {
                this.good = response;
                this.setData();
                this.loadList();
                this.ngxHelperToastService.success(KitchenInventoryInfo[inventory.type].title + ' با موفقیت حذف شد.');
            });
        });
    }
}
