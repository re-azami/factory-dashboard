import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ILoadDraftFlowDTO } from '@lib/apis';

@Component({
    host: { selector: 'flow-plate' },
    templateUrl: './flow-plate.component.html',
    styleUrl: './flow-plate.component.scss',
    standalone: false
})
export class FlowPlateComponent {
    public ngxForm: INgxForm = {
        submit: 'جستجو',
        inputs: [{ name: 'plate', type: 'PLATE', letter: 'ع', autoFocus: true }],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { drafts: ILoadDraftFlowDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const plate: string = values['plate'].join('-');
        if (!this.data.drafts.find((d) => d.plate === plate)) {
            this.ngxHelperToastService.error('حواله‌ای برای شماره پلاک مورد نظر ثبت نشده است.');
            return;
        }

        this.ngxHelperBottomSheetService.close({ plate });
    }
}
