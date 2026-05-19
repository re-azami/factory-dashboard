import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadPartyDTO, ILoadPartyUpdateRq, ILoadPartyUpdateRs } from '@lib/apis';
import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    host: { selector: 'party-update' },
    templateUrl: './party-update.component.html',
    styleUrl: './party-update.component.scss',
    standalone: false
})
export class PartyUpdateComponent {
    public ngxForm: INgxForm = {
        submit: 'ویرایش طرف حساب',
        inputs: [
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.party.title },
            {
                name: 'cargo',
                type: 'GROUP',
                title: 'نوع بارهای مرتبط',
                value: this.data.party.cargo,
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
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { party: ILoadPartyDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.party.id;
        const body: ILoadPartyUpdateRq = {
            title: values['title'],
            cargo: values['cargo'],
        };
        this.apiService.request<ILoadPartyUpdateRs>('LoadPartyUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
