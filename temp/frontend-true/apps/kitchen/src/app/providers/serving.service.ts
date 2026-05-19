import { Injectable } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperHttpService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';

import {
    ApiService,
    IKitchenServingDeleteRs,
    IKitchenServingDownloadRs,
    IKitchenServingDTO,
    IKitchenServingGoodDTO,
} from '@lib/apis';
import { ConfigService, DeviceService } from '@lib/providers';
import { KitchenMealInfo } from '@lib/shared';

import { ServingUpdateComponent } from '../components/serving/update/serving-update.component';

import { KitchenUnitService } from './unit.service';

@Injectable({ providedIn: 'root' })
export class KitchenServingService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly deviceService: DeviceService,
        private readonly kitchenUnitService: KitchenUnitService,
    ) {}

    servingAmount(good: IKitchenServingGoodDTO): number {
        if (!good.serving) return 0;

        return good.serving ? this.kitchenUnitService.valueAmount(good.unit, good.serving) : 0;
    }

    servingPipe(good: IKitchenServingGoodDTO, serving: number): string {
        const amount: number = this.servingAmount(good);
        return amount > 0 ? this.kitchenUnitService.valueTitle(good.unit, Math.ceil(amount * serving)) : '';
    }

    update(serving: IKitchenServingDTO, callback?: (serving: IKitchenServingDTO) => void): void {
        if (serving.isServed) return;

        this.ngxHelperBottomSheetService.open<IKitchenServingDTO>(
            ServingUpdateComponent,
            'ویرایش برنامه غذایی',
            { data: { serving } },
            (serving) => callback?.(serving),
        );
    }

    delete(serving: IKitchenServingDTO, callback?: () => void): void {
        if (serving.isServed) return;

        const item: string = 'برنامه غذایی';
        const title: string =
            KitchenMealInfo[serving.meal].title + ' ' + JalaliDateTime().toTitle(serving.date, { format: 'W، d N Y' });
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = serving.id;
            this.apiService.request<IKitchenServingDeleteRs>('KitchenServingDelete', { ids: { ID } }, () => {
                callback?.();
                this.ngxHelperToastService.success('برنامه غذایی با موفقیت حذف شد.');
            });
        });
    }

    download(serving: string): void {
        this.apiService.request<IKitchenServingDownloadRs>('KitchenServingDownload', { params: { serving } }, (response) => {
            const url: string = this.configService.getApiUrl(response.path);

            if (!this.deviceService.isMobile()) this.ngxHelperHttpService.printPDF(url);
            else {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, url);
            }
        });
    }
}
