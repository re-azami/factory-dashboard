import { Component } from '@angular/core';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadPartyCreateRq, ILoadPartyCreateRs } from '@lib/apis';
import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    host: { selector: 'party-create' },
    templateUrl: './party-create.component.html',
    styleUrl: './party-create.component.scss',
    standalone: false
})
export class PartyCreateComponent {
    public ngxForm: INgxForm = {
        submit: 'ثبت طرف حساب جدید',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان' },
            {
                name: 'cargo',
                type: 'GROUP',
                title: 'نوع بارهای مرتبط',
                groups: LoadCargoList.map((c: LoadCargo) => ({
                    id: c,
                    title: LoadCargoInfo[c].title,
                    icon: LoadCargoInfo[c].icon,
                })),
                minCount: 1,
                description:
                    '\n' +
                    LoadCargoList.filter((c: LoadCargo) => !!LoadCargoInfo[c].description)
                        .map((c: LoadCargo) => `${LoadCargoInfo[c].title}: ${LoadCargoInfo[c].description}`)
                        .join('\n\n'),
            },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadPartyCreateRq = {
            title: values['title'],
            cargo: values['cargo'],
        };
        this.apiService.request<ILoadPartyCreateRs>('LoadPartyCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
