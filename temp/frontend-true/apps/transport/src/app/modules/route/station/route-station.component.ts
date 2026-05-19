import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IOptionDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-station' },
    templateUrl: './route-station.component.html',
    styleUrls: ['./route-station.component.scss'],
    standalone: false
})
export class RouteStationComponent {
    public ngxForm: INgxForm = {
        submit: 'انتخاب ایستگاه',
        inputs: [{ name: 'station', type: 'SELECT', title: 'ایستگاه', options: this.data.stations }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { stations: IOptionDTO[]; action: 'CREATE' | 'SAVE' },
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.router.navigate(['/route', this.data.action.toLowerCase(), values['station']]);
        this.ngxHelperBottomSheetService.close();
    }
}
