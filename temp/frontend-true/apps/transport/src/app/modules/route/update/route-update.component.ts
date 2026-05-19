import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteListDTO, ITransportRouteUpdateRq, ITransportRouteUpdateRs } from '@lib/apis';

@Component({
    host: { selector: 'route-update' },
    templateUrl: './route-update.component.html',
    styleUrls: ['./route-update.component.scss'],
    standalone: false
})
export class RouteUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش مسیر',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.route.title },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                value: this.data.route.description,
                optional: true,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteListDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.route.id;
        const body: ITransportRouteUpdateRq = {
            title: values['title'],
            description: values['description'],
        };
        this.apiService.request<ITransportRouteUpdateRs>('TransportRouteUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
