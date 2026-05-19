import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadCargoInfoRs,
    ILoadDraftDTO,
    ILoadDraftUpdateTransporterRq,
    ILoadDraftUpdateTransporterRs,
} from '@lib/apis';

@Component({
    host: { selector: 'draft-active-update-transporter' },
    templateUrl: './draft-active-update-transporter.component.html',
    styleUrl: './draft-active-update-transporter.component.scss',
    standalone: false
})
export class DraftActiveUpdateTransporterComponent implements OnInit {
    public loading: boolean = true;
    public draft: ILoadDraftDTO = this.data.draft;
    public cargo?: ILoadCargoDTO;

    public ngxForm: INgxForm = {
        submit: 'ویرایش باربری حواله',
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
                    {
                        name: 'transporter',
                        type: 'SELECT',
                        title: 'باربری',
                        value: this.draft.transporter?.id || undefined,
                        options: this.cargo?.transporter?.transporters || [],
                        optional: !this.cargo?.transporter?.required,
                    },
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
        if ((!this.draft.transporter && !values['transporter']) || this.draft.transporter?.id === values['transporter']) {
            this.ngxHelperToastService.error('مقدار باربری تغییر داده نشده است.');
            return;
        }

        const ID: string = this.draft.id;
        const body: ILoadDraftUpdateTransporterRq = {
            transporter: values['transporter'],
            description: values['description'],
        };
        this.apiService.request<ILoadDraftUpdateTransporterRs>('LoadDraftUpdateTransporter', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
