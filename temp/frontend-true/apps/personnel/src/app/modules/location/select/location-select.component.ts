import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelLocationCreateRq, IPersonnelLocationCreateRs, IPersonnelMemberLocationDTO } from '@lib/apis';
import { PersonnelLocation, PersonnelLocationInfo, PersonnelLocationList } from '@lib/shared';

import { ILocation } from '../location.interface';

@Component({
    host: { selector: 'location-select' },
    templateUrl: './location-select.component.html',
    styleUrl: './location-select.component.scss',
    standalone: false
})
export class LocationSelectComponent {
    private locations: ILocation[] = this.data.locations.filter(
        (l) => l.index !== -1 && !l.members.find((m) => m.code === this.data.member.code),
    );
    public location?: ILocation = this.locations.length === 1 ? this.locations[0] : undefined;

    public ngxForm: INgxForm = {
        submit: 'ثبت مکان جدید',
        inputs: [
            {
                inputs: [
                    {
                        type: 'COMMENT',
                        title: 'نام و نام خانوادگی',
                        value: `${this.data.member.name.first} ${this.data.member.name.last}`,
                    },
                    { type: 'COMMENT', title: 'کذ پرسنلی', value: this.data.member.code, english: true },
                ],
                flex: [3, 1],
            },
            {
                name: 'status',
                type: 'SELECT',
                title: 'وضعیت',
                value: this.data.member.location?.status,
                options: PersonnelLocationList.map((location: PersonnelLocation) => ({
                    id: location,
                    title: PersonnelLocationInfo[location].title,
                })),
            },
            {
                name: 'transport',
                type: 'CHECKBOX',
                message: 'پرسنل از سرویس حمل و نقل استفاده می‌کند',
                value: this.data.member.location ? this.data.member.location.transport : true,
                disableOn: (values: INgxFormValues) => values['status'] === 'DRIVER',
            },
            {
                name: 'location',
                type: 'SELECT',
                title: 'مکان',
                options: this.locations.map((l) => ({ id: `location${l.index}`, title: `مکان ${l.index + 1}` })),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { member: IPersonnelMemberLocationDTO; locations: ILocation[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxChange(values: INgxFormValues): void {
        this.location = this.data.locations.find((l) => `location${l.index}` === values['location']);
    }

    ngxSubmit(values: INgxFormValues): void {
        if (!this.location) return;

        const MEMBERID: string = this.data.member.id;
        const body: IPersonnelLocationCreateRq = {
            status: values['status'],
            transport: values['status'] === 'DRIVER' ? false : values['transport'],
            latitude: this.location.latitude,
            longitude: this.location.longitude,
        };
        this.apiService.request<IPersonnelLocationCreateRs>(
            'PersonnelLocationCreate',
            { body, ids: { MEMBERID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
