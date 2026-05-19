import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    IOptionDTO,
    ITransportGroupDTO,
    ITransportLocationDTO,
    ITransportLocationPassengerDTO,
    ITransportLocationPassengerTransferRq,
    ITransportLocationPassengerTransferRs,
} from '@lib/apis';

@Component({
    host: { selector: 'location-passenger-transfer' },
    templateUrl: './location-passenger-transfer.component.html',
    styleUrls: ['./location-passenger-transfer.component.scss'],
    standalone: false
})
export class LocationPassengerTransferComponent {
    public ngxForm: INgxForm = {
        submit: 'انتقال مسافر',
        inputs: [
            [
                { type: 'COMMENT', title: 'گروه', value: this.data.group.title },
                { type: 'COMMENT', title: 'مکان', value: this.data.location.title },
            ],
            { type: 'COMMENT', title: 'نام و نام خانوادگی', value: this.data.passenger.name },
            {
                name: 'location',
                type: 'SELECT',
                title: 'انتقال به',
                options: this.data.locations.filter((l) => l.id !== this.data.location.id),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: {
            group: ITransportGroupDTO;
            locations: IOptionDTO[];
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
        const body: ITransportLocationPassengerTransferRq = { location: values['location'] };
        this.apiService.request<ITransportLocationPassengerTransferRs>(
            'TransportLocationPassengerTransfer',
            { body, ids: { LOCATIONID, ID }, params: { group } },
            (response) => this.ngxHelperBottomSheetService.close(response.from),
        );
    }
}
