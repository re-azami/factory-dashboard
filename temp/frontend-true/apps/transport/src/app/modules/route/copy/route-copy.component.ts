import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteCopyRq, ITransportRouteCopyRs, ITransportRouteListDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-copy' },
    templateUrl: './route-copy.component.html',
    styleUrl: './route-copy.component.scss',
    standalone: false
})
export class RouteCopyComponent {
    public ngxForm: INgxForm = {
        submit: 'کپی مسیر',
        inputs: [
            { type: 'COMMENT', title: 'مسیر', value: this.data.route.title },
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteListDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.route.id;
        const body: ITransportRouteCopyRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ITransportRouteCopyRs>('TransportRouteCopy', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
