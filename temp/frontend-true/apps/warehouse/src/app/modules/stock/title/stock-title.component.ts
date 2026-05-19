import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IWarehouseStockDTO, IWarehouseStockTitleRq, IWarehouseStockTitleRs } from '@lib/apis';

@Component({
    host: { selector: 'stock-title' },
    templateUrl: './stock-title.component.html',
    styleUrls: ['./stock-title.component.scss'],
    standalone: false
})
export class StockTitleComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش عنوان کالا',
        inputs: [{ name: 'title', type: 'TEXT', title: 'عنوان کالا', value: this.data.stock.title }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { stock: IWarehouseStockDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.stock.id;
        const body: IWarehouseStockTitleRq = { title: values['title'] };
        this.apiService.request<IWarehouseStockTitleRs>('WarehouseStockTitle', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
