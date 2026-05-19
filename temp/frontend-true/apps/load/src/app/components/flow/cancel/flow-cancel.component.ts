import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { ILoadDraftDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'flow-cancel' },
    imports: [NgxFormModule, NgxHelperPlateModule],
    templateUrl: './flow-cancel.component.html',
    styleUrl: './flow-cancel.component.scss'
})
export class FlowCancelComponent {
    public draft: ILoadDraftDTO = this.data.draft;
    public ngxForm: INgxForm = {
        submit: 'لغو حواله',
        inputs: [
            { inputs: [{ type: 'COMMENT', title: 'حواله', value: this.draft.code, english: true }], flex: [0.6] },
            {
                type: 'COMMENT',
                title: 'بار',
                value: this.draft.cargo.title,
                description: `نوع بار: ${LoadCargoInfo[this.draft.cargo.type].title}`,
            },
            {
                name: 'description',
                type: 'TEXTAREA',
                title: 'توضیحات',
                description: 'توضیحات در گزارش تغییرات حواله نمایش داده می‌شود.',
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        this.ngxHelperBottomSheetService.close({ description: values['description'] });
    }
}
