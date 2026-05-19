import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ILaboratoryTestGrindDTO } from '@lib/apis';
import { IPageBlock, PageModule } from '@lib/page';

@Component({
    host: { selector: 'info-grind' },
    imports: [CommonModule, PageModule],
    templateUrl: './info-grind.component.html',
    styleUrl: './info-grind.component.scss'
})
export class InfoGrindComponent implements OnInit, OnDestroy {
    public grind?: ILaboratoryTestGrindDTO = this.data.grind;
    public sizes: number[] = (this.grind?.sizes || []).map((s) => s.size);
    public values: number[] = (this.grind?.sizes || []).map((s) => s.value);
    public blocks: IPageBlock[][] = [[{ title: 'نتیجه آزمایش', value: this.grind?.result || '' }]];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { grind?: ILaboratoryTestGrindDTO }) {}

    ngOnInit(): void {
        if (this.sizes.length !== 0) {
            const size: number = (this.sizes.length + 1) * 70;
            document.documentElement.style.setProperty('--ngxHelperDialogWidth', `${size}px`);
        }
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
    }
}
