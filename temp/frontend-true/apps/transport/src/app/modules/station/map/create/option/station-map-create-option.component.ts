import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ITransportLocationDTO } from '@lib/apis';

@Component({
    host: { selector: 'station-map-create-option' },
    templateUrl: './station-map-create-option.component.html',
    styleUrls: ['./station-map-create-option.component.scss'],
    standalone: false
})
export class StationMapCreateOptionComponent {
    public ngxForm: INgxForm = {
        submit: 'محاسبه ایستگاه‌ها',
        inputs: [
            [
                {
                    type: 'COMMENT',
                    title: 'تعداد مکان',
                    value: Helper.NUMBER.format(this.data.locations.length, 'EN'),
                    english: true,
                },
                {
                    type: 'COMMENT',
                    title: 'تعداد مسافر',
                    value: Helper.NUMBER.format(
                        this.data.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
                        'EN',
                    ),
                    english: true,
                },
            ],
            {
                name: 'count',
                type: 'NUMBER',
                title: 'تعداد ایستگاه',
                minimum: this.data.locations.length > 10 ? 10 : 1,
                maximum: this.data.locations.length,
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { locations: ITransportLocationDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.ngxHelperBottomSheetService.close({ count: values['count'] });
    }
}
