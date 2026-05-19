import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowOutWeightEmptyRq, ILoadFlowOutWeightEmptyRs } from '@lib/apis';

import { LoadSettingService } from '../../../../providers';

@Component({
    host: { selector: 'flow-out-weight-empty' },
    templateUrl: './flow-out-weight-empty.component.html',
    styleUrl: './flow-out-weight-empty.component.scss',
    standalone: false
})
export class FlowOutWeightEmptyComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            {
                name: 'empty',
                type: 'NUMBER',
                title: 'وزن خالی',
                suffix: 'کیلو',
                minimum: 10_000,
                maximum: this.loadSettingService.weight.empty,
                multiplyOf: this.loadSettingService.weight.multiply,
                autoFocus: true,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowOutWeightEmptyRq = {
            empty: values['empty'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowOutWeightEmptyRs>('LoadFlowOutWeightEmpty', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
