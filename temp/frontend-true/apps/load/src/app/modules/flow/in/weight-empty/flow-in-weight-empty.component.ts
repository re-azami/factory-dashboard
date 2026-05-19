import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInWeightEmptyRq, ILoadFlowInWeightEmptyRs } from '@lib/apis';

import { LoadSettingService } from '../../../../providers';

@Component({
    host: { selector: 'flow-in-weight-empty' },
    templateUrl: './flow-in-weight-empty.component.html',
    styleUrl: './flow-in-weight-empty.component.scss',
    standalone: false
})
export class FlowInWeightEmptyComponent implements OnInit {
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
                    name: 'empty',
                    type: 'NUMBER',
                    title: 'وزن خالی',
                    value: this.draft.weight.empty,
                    suffix: 'کیلو',
                    minimum: 10_000,
                    maximum: this.loadSettingService.weight.empty,
                    multiplyOf: this.loadSettingService.weight.multiply,
                    autoFocus: true,
                },
                {
                    type: 'COMMENT',
                    title: 'وزن پر',
                    value: Helper.NUMBER.format(this.draft.weight.full, 'EN'),
                    english: true,
                },
            ],
            { type: 'COMMENT', title: 'وزن خالص', value: '', onChange: this.getWeight.bind(this), english: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    getWeight(values: INgxFormValues): string | null {
        if (
            isNaN(values['empty']) ||
            values['empty'] > this.draft.weight.full ||
            values['empty'] < 10_000 ||
            values['empty'] > this.loadSettingService.weight.empty
        )
            return null;
        return Helper.NUMBER.format(this.draft.weight.full - values['empty'], 'EN');
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowInWeightEmptyRq = {
            empty: values['empty'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInWeightEmptyRs>('LoadFlowInWeightEmpty', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
