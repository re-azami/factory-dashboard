import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';
import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ApiService, IWarehouseExportCategoryKeyRq, IWarehouseExportCategoryKeyRs } from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList, WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';
import { IWarehouseCategory } from '../../../app.interface';

@Component({
    host: { selector: 'help-key' },
    templateUrl: './help-key.component.html',
    styleUrls: ['./help-key.component.scss'],
    standalone: false
})
export class HelpKeyComponent implements OnInit {
    public exportTypeList = ExportTypeList;
    public exportTypeInfo = ExportTypeInfo;

    public values: INgxHelperValue[] = [{ title: 'سوال', value: WarehouseQuestion[this.data.indent].title }];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { indent: number },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        const categories: IWarehouseCategory[] = this.warehouseToolsService.categories.filter(
            (c) => c.indent === this.data.indent,
        );

        const map: Map<string, Set<string>> = new Map<string, Set<string>>();
        categories.forEach((c) => {
            const key: string = c.dto.key;
            if (!map.get(key)) map.set(key, new Set<string>());
            map.get(key)?.add(c.dto.title);
        });

        const count: number = [...map.values()].reduce((sum: number, s) => sum + s.size, 0);
        this.values.push({ title: 'تعداد گروه‌ها', value: { type: 'NUMBER', value: count } });
    }

    export(type: ExportType): void {
        const body: IWarehouseExportCategoryKeyRq = { type, indent: this.data.indent };
        this.apiService.request<IWarehouseExportCategoryKeyRs>('WarehouseExportCategoryKey', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            this.ngxHelperBottomSheetService.close();
        });
    }
}
