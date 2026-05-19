import { Injectable } from '@angular/core';

import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class ExportService {
    getMenu(callback: (type: ExportType) => void): NgxHelperMenu[] {
        return ExportTypeList.map((type: ExportType) => ({
            title: ExportTypeInfo[type].title,
            click: () => callback(type),
        }));
    }
}
