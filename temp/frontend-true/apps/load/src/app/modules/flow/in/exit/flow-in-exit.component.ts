import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowInExitRq, ILoadFlowInExitRs } from '@lib/apis';

import { LoadToolsService } from '../../../../providers';

@Component({
    host: { selector: 'flow-in-exit' },
    templateUrl: './flow-in-exit.component.html',
    styleUrl: './flow-in-exit.component.scss',
    standalone: false
})
export class FlowInExitComponent implements OnInit {
    public draft: ILoadDraftFlowDTO = this.data.draft;
    public ngxForm: INgxForm = this.data.ngxForm;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftFlowDTO; ngxForm: INgxForm },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
            { name: 'issue', type: 'CHECKBOX', message: 'صدور حواله جدید برای ناوگان', value: true },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.draft.id;
        const body: ILoadFlowInExitRq = {
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInExitRs>('LoadFlowInExit', { body, ids: { ID } }, (response) => {
            this.ngxHelperBottomSheetService.close(response);
            if (values['issue'] === true) this.loadToolsService.createDraft(this.draft.plate);
        });
    }
}
