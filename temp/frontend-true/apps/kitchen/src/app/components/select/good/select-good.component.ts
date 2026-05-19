import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenu, NgxHelperMenuModule } from '@webilix/ngx-helper/menu';

import { ApiService, IKitchenActiveGoodRs, IKitchenGoodDTO, IKitchenGoodListDTO } from '@lib/apis';
import { KitchenGood, KitchenGoodInfo, KitchenGoodList } from '@lib/shared';

@Component({
    host: { selector: 'select-good' },
    imports: [MatButton, MatIcon, NgxHelperLoaderModule, NgxHelperMenuModule],
    templateUrl: './select-good.component.html',
    styleUrl: './select-good.component.scss',
})
export class SelectGoodComponent implements OnInit {
    public kitchenGoodList = KitchenGoodList;
    public kitchenGoodInfo = KitchenGoodInfo;

    public loading: boolean = true;
    public goods: IKitchenGoodListDTO[] = [];
    public filtered: IKitchenGoodListDTO[] = [];

    public goodMenu: NgxHelperMenu[] = [
        ...KitchenGoodList.map((good: KitchenGood) => ({
            title: KitchenGoodInfo[good].title,
            icon: KitchenGoodInfo[good].icon,
            click: () => this.setGood(good),
            disableOn: () => this.goodFilter === good,
        })),
        'DIVIDER',
        {
            title: 'همه موارد',
            icon: 'inventory_2',
            click: () => this.setGood(),
            disableOn: () => !this.goodFilter,
        },
    ];

    public good?: KitchenGood = this.data.good;
    public goodFilter?: KitchenGood = this.data.good;
    public queryFilter: string = '';

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { good?: KitchenGood; ignore?: string[] },
        private readonly apiService: ApiService,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<IKitchenActiveGoodRs>('KitchenActiveGood', (response) => {
            this.loading = false;
            this.goods = response;

            this.filter();
        });
    }

    setGood(good?: KitchenGood): void {
        this.goodFilter = good;
        this.filter();
    }

    setQuery(query: string): void {
        if (!Helper.IS.string(query)) query = '';
        query = query.trim();
        if (query === this.queryFilter) return;

        this.queryFilter = query;
        this.filter();
    }

    filter(): void {
        this.filtered = [...this.goods]
            .filter((good: IKitchenGoodListDTO) => !this.data.ignore || !this.data.ignore.includes(good.id))
            .filter((good: IKitchenGoodListDTO) => !this.goodFilter || good.good === this.goodFilter)
            .filter((good: IKitchenGoodListDTO) => !this.queryFilter || good.title.indexOf(this.queryFilter) !== -1);
    }

    select(good: IKitchenGoodListDTO): void {
        const ID: string = good.id;
        this.apiService.request<IKitchenGoodDTO>('KitchenGoodInfo', { ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
