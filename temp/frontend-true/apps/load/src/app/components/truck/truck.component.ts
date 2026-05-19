import { Component } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadTruckPlateRs } from '@lib/apis';

@Component({
    host: { selector: 'truck' },
    imports: [NgxFormModule],
    templateUrl: './truck.component.html',
    styleUrl: './truck.component.scss'
})
export class TruckComponent {
    public ngxForm: INgxForm = {
        submit: 'جستجو',
        inputs: [{ name: 'plate', type: 'PLATE', letter: 'ع', autoFocus: true }],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const plate: string = values['plate'].join('-');
        this.apiService.request<ILoadTruckPlateRs>('LoadTruckPlate', { params: { plate } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
