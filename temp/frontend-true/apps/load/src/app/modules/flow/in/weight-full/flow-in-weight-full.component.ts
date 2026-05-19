import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInWeightFullRq, ILoadFlowInWeightFullRs } from '@lib/apis';

import { LoadSettingService } from '../../../../providers';

@Component({
    host: { selector: 'flow-in-weight-full' },
    templateUrl: './flow-in-weight-full.component.html',
    styleUrl: './flow-in-weight-full.component.scss',
    standalone: false
})
export class FlowInWeightFullComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    public hasWeightEmptyStep: boolean = this.draft.steps.includes('WEIGHT_EMPTY');
    public showEmptyWeight: boolean = !this.hasWeightEmptyStep && !!this.draft.weight.empty;

    public emptyChanged: boolean = false;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        const weightEmptyInput: NgxFormInputs = {
            name: 'empty',
            type: 'NUMBER',
            title: 'وزن خالی',
            value: this.draft.weight.empty,
            suffix: 'کیلو',
            minimum: 10_000,
            maximum: this.loadSettingService.weight.empty,
            multiplyOf: this.loadSettingService.weight.multiply,
        };

        const weightFullInput: NgxFormInputs = {
            name: 'full',
            type: 'NUMBER',
            title: 'وزن پر',
            suffix: 'کیلو',
            minimum: this.loadSettingService.weight.full,
            maximum: 99_999,
            multiplyOf: this.loadSettingService.weight.multiply,
            autoFocus: true,
        };

        const netWeightInput: NgxFormInputs = {
            type: 'COMMENT',
            title: 'وزن خالص',
            value: '',
            onChange: this.getWeight.bind(this),
            english: true,
        };

        this.ngxForm.inputs.push(
            this.showEmptyWeight ? [weightEmptyInput, weightFullInput] : weightFullInput,
            this.showEmptyWeight ? netWeightInput : [],
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    getWeight(values: INgxFormValues): string | null {
        this.emptyChanged = values['empty'] !== this.draft.weight.empty;

        if (isNaN(values['empty']) || values['empty'] < 10_000 || values['empty'] > this.loadSettingService.weight.empty)
            return null;
        if (isNaN(values['full']) || values['full'] < this.loadSettingService.weight.full || values['full'] > 99_999)
            return null;
        if (values['full'] <= values['empty']) return null;

        return Helper.NUMBER.format(values['full'] - values['empty'], 'EN');
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowInWeightFullRq = {
            empty: this.showEmptyWeight ? values['empty'] : null,
            full: values['full'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInWeightFullRs>('LoadFlowInWeightFull', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
