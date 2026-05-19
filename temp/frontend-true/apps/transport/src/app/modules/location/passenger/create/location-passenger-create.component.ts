import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationPassengerCreateRq,
    ITransportLocationPassengerCreateRs,
} from '@lib/apis';
import { TransportPassenger, TransportPassengerInfo, TransportPassengerList } from '@lib/shared';

@Component({
    host: { selector: 'location-passenger-create' },
    templateUrl: './location-passenger-create.component.html',
    styleUrls: ['./location-passenger-create.component.scss'],
    standalone: false
})
export class LocationPassengerCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت مسافر جدید',
        inputs: [
            [
                { type: 'COMMENT', title: 'گروه', value: this.data.group.title },
                { type: 'COMMENT', title: 'مکان', value: this.data.location.title },
            ],
            [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع مسافر',
                    options: TransportPassengerList.map((passenger: TransportPassenger) => ({
                        id: passenger,
                        title: TransportPassengerInfo[passenger].title,
                    })),
                },
                { name: 'code', type: 'NUMERIC', title: 'کد پرسنلی', minLength: 4, maxLength: 4 },
            ],
            { name: 'name', type: 'TEXT', title: 'نام و نام خانوادگی' },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: ITransportGroupDTO; location: ITransportLocationDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const group: string = this.data.group.id;
        const LOCATIONID: string = this.data.location.id;
        const body: ITransportLocationPassengerCreateRq = {
            type: values['type'],
            code: values['code'],
            name: values['name'],
        };
        this.apiService.request<ITransportLocationPassengerCreateRs>(
            'TransportLocationPassengerCreate',
            { body, ids: { LOCATIONID }, params: { group } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
