import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationPassengerDTO,
    ITransportLocationPassengerUpdateRq,
    ITransportLocationPassengerUpdateRs,
} from '@lib/apis';
import { TransportPassenger, TransportPassengerInfo, TransportPassengerList } from '@lib/shared';

@Component({
    host: { selector: 'location-passenger-update' },
    templateUrl: './location-passenger-update.component.html',
    styleUrls: ['./location-passenger-update.component.scss'],
    standalone: false
})
export class LocationPassengerUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش مسافر',
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
                    value: this.data.passenger.type,
                    options: TransportPassengerList.map((passenger: TransportPassenger) => ({
                        id: passenger,
                        title: TransportPassengerInfo[passenger].title,
                    })),
                },
                {
                    name: 'code',
                    type: 'NUMERIC',
                    title: 'کد پرسنلی',
                    value: this.data.passenger.code || undefined,
                    minLength: 4,
                    maxLength: 4,
                },
            ],
            { name: 'name', type: 'TEXT', title: 'نام و نام خانوادگی', value: this.data.passenger.name },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            group: ITransportGroupDTO;
            location: ITransportLocationDTO;
            passenger: ITransportLocationPassengerDTO;
        },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const group: string = this.data.group.id;
        const LOCATIONID: string = this.data.location.id;
        const ID: string = this.data.passenger.id;
        const body: ITransportLocationPassengerUpdateRq = {
            type: values['type'],
            code: values['code'],
            name: values['name'],
        };
        this.apiService.request<ITransportLocationPassengerUpdateRs>(
            'TransportLocationPassengerUpdate',
            { body, ids: { LOCATIONID, ID }, params: { group } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
