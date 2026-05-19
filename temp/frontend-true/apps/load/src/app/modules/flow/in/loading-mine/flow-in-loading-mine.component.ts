import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInLoadingMineRq, ILoadFlowInLoadingMineRs } from '@lib/apis';

@Component({
    host: { selector: 'flow-in-loading-mine' },
    templateUrl: './flow-in-loading-mine.component.html',
    styleUrl: './flow-in-loading-mine.component.scss',
    standalone: false
})
export class FlowInLoadingMineComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            {
                inputs: [
                    {
                        name: 'empty',
                        type: 'NUMBER',
                        title: 'وزن خالی',
                        suffix: 'کیلو',
                        minimum: 10_000,
                        maximum: 99_999,
                        optional: true,
                        autoFocus: true,
                    },
                    {
                        name: 'full',
                        type: 'NUMBER',
                        title: 'وزن پر',
                        suffix: 'کیلو',
                        minimum: 10_000,
                        maximum: 99_999,
                        optional: true,
                    },
                    { type: 'COMMENT', title: 'وزن خالص', value: '', onChange: this.getWeight.bind(this), english: true },
                ],
                flex: [1, 1, 0.75],
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    getWeight(values: INgxFormValues): string | null {
        if (isNaN(values['empty']) || values['empty'] < 10_000 || values['empty'] > 99_999) return null;
        if (isNaN(values['full']) || values['full'] < 10_000 || values['full'] > 99_999) return null;
        if (values['full'] <= values['empty']) return null;

        return Helper.NUMBER.format(values['full'] - values['empty'], 'EN');
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowInLoadingMineRq = {
            empty: values['empty'],
            full: values['full'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInLoadingMineRs>('LoadFlowInLoadingMine', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
