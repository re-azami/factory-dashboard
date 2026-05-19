import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadActiveCargoRs, ILoadDraftDTO, ILoadDraftUpdateCargoRq, ILoadDraftUpdateCargoRs } from '@lib/apis';
import { LoadCargo, LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'draft-active-update-cargo' },
    templateUrl: './draft-active-update-cargo.component.html',
    styleUrl: './draft-active-update-cargo.component.scss',
    standalone: false
})
export class DraftActiveUpdateCargoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public loading: boolean = true;
    public draft: ILoadDraftDTO = this.data.draft;

    public ngxForm: INgxForm = {
        submit: 'ویرایش بار حواله',
        inputs: [],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const type: LoadCargo = this.draft.cargo.type;
        this.apiService.request<ILoadActiveCargoRs>(
            'LoadActiveCargo',
            { params: { type }, silent: true, loading: false },
            (response) => {
                this.loading = false;
                this.ngxForm.inputs.push(
                    { name: 'cargo', type: 'SELECT', title: 'بار', value: this.draft.cargo.id, options: response },
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        description: 'توضیحات در گزارش تغییرات حواله نمایش داده خواهد شد.',
                    },
                );
            },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.draft.cargo.id === values['cargo']) {
            this.ngxHelperToastService.error('مقدار بار تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateCargoRq = {
            cargo: values['cargo'],
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateCargoRs>('LoadDraftUpdateCargo', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
