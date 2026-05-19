import { Component, Inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButton } from '@angular/material/button';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenServingDoneRs, IKitchenServingDTO } from '@lib/apis';

@Component({
    host: { selector: 'serving-done' },
    imports: [MatButton],
    templateUrl: './serving-done.component.html',
    styleUrl: './serving-done.component.scss',
})
export class ServingDoneComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { serving: IKitchenServingDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    done(): void {
        const ID: string = this.data.serving.id;
        this.apiService.request<IKitchenServingDoneRs>('KitchenServingDone', { ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('اطلاعات سرو با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }

    close(): void {
        this.ngxHelperBottomSheetService.close();
    }
}
