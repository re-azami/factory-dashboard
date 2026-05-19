import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ILaboratoryTestFeODTO } from '@lib/apis';
import { IPageBlock, PageModule } from '@lib/page';

@Component({
    host: { selector: 'info-feo' },
    imports: [PageModule],
    templateUrl: './info-feo.component.html',
    styleUrl: './info-feo.component.scss'
})
export class InfoFeoComponent {
    public feo?: ILaboratoryTestFeODTO = this.data.feo;
    public blocks: IPageBlock[][] = [
        [
            { title: 'وزن', value: this.feo?.weight || '' },
            { title: 'حجم', value: this.feo?.volume || '' },
            { title: 'استاندارد', value: this.feo?.standard || '' },
        ],
        [{ title: 'نتیجه آزمایش', value: this.feo?.result || '' }],
    ];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { feo?: ILaboratoryTestFeODTO }) {}
}
