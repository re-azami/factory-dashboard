import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowOutWeightFullRq, ILoadFlowOutWeightFullRs } from '@lib/apis';

import { LoadSettingService } from '../../../../providers';

@Component({
    host: { selector: 'flow-out-weight-full' },
    templateUrl: './flow-out-weight-full.component.html',
    styleUrl: './flow-out-weight-full.component.scss',
    standalone: false
})
export class FlowOutWeightFullComponent implements OnInit {
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
            [
                {
                    type: 'COMMENT',
                    title: 'وزن خالی',
                    value: Helper.NUMBER.format(this.draft.weight.empty, 'EN'),
                    english: true,
                },
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
            ],
            { type: 'COMMENT', title: 'وزن خالص', value: '', onChange: this.getWeight.bind(this), english: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    getWeight(values: INgxFormValues): string | null {
        if (
            isNaN(values['full']) ||
            values['full'] < this.draft.weight.empty ||
            values['full'] > 99_999 ||
            values['full'] < this.loadSettingService.weight.full
        )
            return null;
        return Helper.NUMBER.format(values['full'] - this.draft.weight.empty, 'EN');
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowOutWeightFullRq = {
            full: values['full'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowOutWeightFullRs>('LoadFlowOutWeightFull', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
