import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInDischargeRq, ILoadFlowInDischargeRs } from '@lib/apis';

@Component({
    host: { selector: 'flow-in-discharge' },
    templateUrl: './flow-in-discharge.component.html',
    styleUrl: './flow-in-discharge.component.scss',
    standalone: false
})
export class FlowInDischargeComponent implements OnInit {
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
        const body: ILoadFlowInDischargeRq = {
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInDischargeRs>('LoadFlowInDischarge', { body, ids: { ID } }, (response) =>
            this.ngxHelperBottomSheetService.close(response),
        );
    }
}
