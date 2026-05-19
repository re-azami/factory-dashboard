import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowBuyWeightFullRq, ILoadFlowBuyWeightFullRs } from '@lib/apis';

import { LoadSettingService } from '../../../../providers';

@Component({
    host: { selector: 'flow-buy-weight-full' },
    templateUrl: './flow-buy-weight-full.component.html',
    styleUrl: './flow-buy-weight-full.component.scss',
    standalone: false
})
export class FlowBuyWeightFullComponent implements OnInit {
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
                name: 'full',
                type: 'NUMBER',
                title: 'وزن پر',
                suffix: 'کیلو',
                minimum: this.loadSettingService.weight.full,
                maximum: 99_999,
                multiplyOf: this.loadSettingService.weight.multiply,
                autoFocus: true,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowBuyWeightFullRq = {
            full: values['full'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowBuyWeightFullRs>('LoadFlowBuyWeightFull', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
