import { Component } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { MaterialModule } from '@lib/modules';
import { LoadPrintPage, LoadPrintPageInfo, LoadPrintPageList, Storages } from '@lib/shared';

@Component({
    host: { selector: 'print-page' },
    imports: [MaterialModule],
    templateUrl: './print-page.component.html',
    styleUrl: './print-page.component.scss'
})
export class PrintPageComponent {
    public loadPrintPageList = LoadPrintPageList;
    public loadPrintPageInfo = LoadPrintPageInfo;

    public save: boolean = false;

    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    select(page: LoadPrintPage): void {
        if (this.save) localStorage.setItem(Storages.LOAD_PRINT_PAGE, page);
        this.ngxHelperBottomSheetService.close({ page });
    }

    cancel(): void {
        this.ngxHelperBottomSheetService.close();
    }
}
