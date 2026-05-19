import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadCargoInfoRs,
    ILoadDraftDTO,
    ILoadDraftUpdatePlateRq,
    ILoadDraftUpdatePlateRs,
} from '@lib/apis';

@Component({
    host: { selector: 'draft-active-update-plate' },
    templateUrl: './draft-active-update-plate.component.html',
    styleUrl: './draft-active-update-plate.component.scss',
    standalone: false
})
export class DraftActiveUpdatePlateComponent implements OnInit {
    public loading: boolean = true;
    public draft: ILoadDraftDTO = this.data.draft;
    public cargo?: ILoadCargoDTO;

    public ngxForm: INgxForm = {
        submit: 'ویرایش پلاک حواله',
        inputs: [],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.draft.cargo.id;
        this.apiService.request<ILoadCargoInfoRs>(
            'LoadCargoInfo',
            { ids: { ID }, silent: true, loading: false },
            (response) => {
                this.loading = false;
                this.cargo = response;

                this.ngxForm.inputs.push(
                    { name: 'plate', type: 'PLATE', value: this.draft.plate.split('-') as any, letter: 'ع' },
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
        if (this.draft.plate === values['plate'].join('-')) {
            this.ngxHelperToastService.error('مقدار پلاک تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdatePlateRq = {
            plate: values['plate'].join('-'),
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdatePlateRs>('LoadDraftUpdatePlate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
