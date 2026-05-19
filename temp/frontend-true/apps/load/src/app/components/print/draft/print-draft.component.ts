import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftDownloadRs } from '@lib/apis';
import { ConfigService, DeviceService } from '@lib/providers';
import { LoadPrintPage, LoadPrintPageInfo, LoadPrintPageList } from '@lib/shared';

@Component({
    host: { selector: 'print-draft' },
    imports: [NgxFormModule],
    templateUrl: './print-draft.component.html',
    styleUrl: './print-draft.component.scss'
})
export class PrintDraftComponent {
    public ngxForm: INgxForm = {
        submit: 'پرینت حواله',
        inputs: [
            { name: 'draft', type: 'MASK', title: 'شماره حواله', mask: 'A000000-000', icon: 'assignment' },
            {
                name: 'page',
                type: 'SELECT',
                title: 'نوع صفحه',
                options: LoadPrintPageList.map((p: LoadPrintPage) => ({ id: p, title: LoadPrintPageInfo[p].title })),
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly deviceService: DeviceService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const draft: string = values['draft'];
        const page: LoadPrintPage = values['page'];

        this.apiService.request<ILoadDraftDownloadRs>('LoadDraftDownload', { params: { draft, page } }, (response) => {
            const url: string = this.configService.getApiUrl(response.path);

            if (!this.deviceService.isMobile()) this.ngxHelperHttpService.printPDF(url);
            else {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, url);
            }
            this.ngxHelperBottomSheetService.close();
        });
    }
}
