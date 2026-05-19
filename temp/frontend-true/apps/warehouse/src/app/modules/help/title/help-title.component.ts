import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ApiService, IWarehouseExportCategoryTitleRq, IWarehouseExportCategoryTitleRs } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList, WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';

@Component({
    host: { selector: 'help-title' },
    templateUrl: './help-title.component.html',
    styleUrls: ['./help-title.component.scss'],
    standalone: false
})
export class HelpTitleComponent {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public values: INgxHelperValue[] = [
        { title: 'سوال', value: WarehouseQuestion[this.data.indent].title },
        {
            title: 'تعداد گروه‌ها',
            value: {
                type: 'NUMBER',
                value: this.warehouseToolsService.categories.filter((c) => c.indent === this.data.indent).length,
            },
        },
    ];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { indent: number },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly warehouseToolsService: WarehouseToolsService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    export(type: ExportType): void {
        const body: IWarehouseExportCategoryTitleRq = { type, indent: this.data.indent };
        this.apiService.request<IWarehouseExportCategoryTitleRs>('WarehouseExportCategoryTitle', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            this.ngxHelperBottomSheetService.close();
        });
    }
}
