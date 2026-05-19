import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { LoadPrintPage, LoadPrintPageInfo, LoadPrintPageList, Storages } from '@lib/shared';

@Component({
    host: { selector: 'print-setting' },
    imports: [NgxFormModule],
    templateUrl: './print-setting.component.html',
    styleUrl: './print-setting.component.scss'
})
export class PrintSettingComponent {
    public ngxForm: INgxForm = {
        submit: 'تنظیمات پرینت',
        inputs: [
            {
                name: 'page',
                type: 'SELECT',
                title: 'اندازه صفحه پیش‌فرض حواله',
                value: localStorage.getItem(Storages.LOAD_PRINT_PAGE) || undefined,
                options: LoadPrintPageList.map((page: LoadPrintPage) => ({
                    id: page,
                    title: LoadPrintPageInfo[page].title,
                })),
                optional: true,
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    ngxSubmit(values: INgxFormValues): void {
        const page: LoadPrintPage = values['page'];

        if (LoadPrintPageList.includes(page)) localStorage.setItem(Storages.LOAD_PRINT_PAGE, page);
        else localStorage.removeItem(Storages.LOAD_PRINT_PAGE);

        this.ngxHelperBottomSheetService.close();
    }
}
