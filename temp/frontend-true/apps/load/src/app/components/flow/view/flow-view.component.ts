import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { ILoadDraftDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { IPageBlock, PageModule } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'flow-view' },
    imports: [NgxHelperPipeModule, NgxHelperPlateModule, MaterialModule, PageModule],
    templateUrl: './flow-view.component.html',
    styleUrl: './flow-view.component.scss'
})
export class FlowViewComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public draft: ILoadDraftDTO = this.data.draft;

    public blocks: IPageBlock[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { draft: ILoadDraftDTO },
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.blocks = [
            { title: `شماره ${LoadCargoInfo[this.draft.cargo.type].draft}`, value: this.draft.code, english: true },
            {
                title: 'فرایند',
                value: LoadCargoInfo[this.draft.cargo.type].steps.find((s) => s.id === this.draft.step)?.title || '',
            },
        ];
    }

    print(): void {
        this.loadToolsService.downloadDraft(this.draft.code);
    }

    view(): void {
        this.ngxHelperBottomSheetService.close();
        this.router.navigate(['/draft', 'info', this.draft.id]);
    }
}
