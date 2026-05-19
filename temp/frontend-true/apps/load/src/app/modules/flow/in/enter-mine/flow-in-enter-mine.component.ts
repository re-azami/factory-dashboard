import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInEnterMineRq, ILoadFlowInEnterMineRs } from '@lib/apis';

@Component({
    host: { selector: 'flow-in-enter-mine' },
    templateUrl: './flow-in-enter-mine.component.html',
    styleUrl: './flow-in-enter-mine.component.scss',
    standalone: false
})
export class FlowInEnterMineComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push({ name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true });
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowInEnterMineRq = {
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInEnterMineRs>('LoadFlowInEnterMine', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
