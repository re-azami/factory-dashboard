import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IKitchenGoodDTO } from '@lib/apis';
import { KitchenInventory, KitchenInventoryInfo } from '@lib/shared';

import { InventoryCreateComponent } from '../components/inventory/create/inventory-create.component';
import { InventoryInitialComponent } from '../components/inventory/initial/inventory-initial.component';

import { KitchenToolsService } from './tools.service';

@Injectable({ providedIn: 'root' })
export class KitchenInventoryService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly kitchenToolsService: KitchenToolsService,
    ) {}

    inventoryInitial(good: IKitchenGoodDTO, callback?: (good: IKitchenGoodDTO) => void): void {
        this.ngxHelperBottomSheetService.open<IKitchenGoodDTO>(
            InventoryInitialComponent,
            'تغییر موجودی اولیه',
            { data: { good } },
            (response) => callback?.(response),
        );
    }

    inventoryCreate(type: KitchenInventory, good?: IKitchenGoodDTO, callback?: (good: IKitchenGoodDTO) => void): void {
        if (!KitchenInventoryInfo[type].userAction) return;

        if (!good) this.kitchenToolsService.selectGood().then((good) => this.inventoryCreate(type, good, callback));
        else
            this.ngxHelperBottomSheetService.open<IKitchenGoodDTO>(
                InventoryCreateComponent,
                KitchenInventoryInfo[type].title,
                { data: { good, type } },
                (response) => callback?.(response),
            );
    }
}
