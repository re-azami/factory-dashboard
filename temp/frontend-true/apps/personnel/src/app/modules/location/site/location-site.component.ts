import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelLocationCreateRq, IPersonnelLocationCreateRs, IPersonnelMemberLocationDTO } from '@lib/apis';
import { PersonnelLocation, PersonnelLocationInfo, PersonnelLocationList } from '@lib/shared';

import { LocationCoordinates } from '../location.coordinate';

@Component({
    host: { selector: 'location-site' },
    templateUrl: './location-site.component.html',
    styleUrl: './location-site.component.scss',
    standalone: false
})
export class LocationSiteComponent {
    public ngxForm: INgxForm = {
        submit: 'ساکن در سایت',
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
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { member: IPersonnelMemberLocationDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const MEMBERID: string = this.data.member.id;
        const body: IPersonnelLocationCreateRq = {
            status: values['status'],
            transport: false,
            latitude: LocationCoordinates.SITE.latitude,
            longitude: LocationCoordinates.SITE.longitude,
        };
        this.apiService.request<IPersonnelLocationCreateRs>(
            'PersonnelLocationCreate',
            { body, ids: { MEMBERID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
