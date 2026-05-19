import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ILaboratoryTestFeDTO } from '@lib/apis';
import { IPageBlock, PageModule } from '@lib/page';

@Component({
    host: { selector: 'info-fe' },
    imports: [PageModule],
    templateUrl: './info-fe.component.html',
    styleUrl: './info-fe.component.scss'
})
export class InfoFeComponent {
    public fe?: ILaboratoryTestFeDTO = this.data.fe;
    public blocks: IPageBlock[][] = [
        [
            { title: 'وزن', value: this.fe?.weight || '' },
            { title: 'حجم', value: this.fe?.volume || '' },
            { title: 'استاندارد', value: this.fe?.standard || '' },
        ],
        [{ title: 'نتیجه آزمایش', value: this.fe?.result || '' }],
    ];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { fe?: ILaboratoryTestFeDTO }) {}
}
