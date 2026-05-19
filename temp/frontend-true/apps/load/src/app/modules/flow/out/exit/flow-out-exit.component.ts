import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowOutExitRq, ILoadFlowOutExitRs } from '@lib/apis';

@Component({
    host: { selector: 'flow-out-exit' },
    templateUrl: './flow-out-exit.component.html',
    styleUrl: './flow-out-exit.component.scss',
    standalone: false
})
export class FlowOutExitComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            { name: 'bitaBill', type: 'TEXT', title: 'شماره بارنامه بیتا', english: true, optional: true },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowOutExitRq = {
            bitaBill: values['bitaBill'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowOutExitRs>('LoadFlowOutExit', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
