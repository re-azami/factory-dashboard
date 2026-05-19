import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ILaboratoryTestMoistureDTO } from '@lib/apis';
import { IPageBlock, PageModule } from '@lib/page';

@Component({
    host: { selector: 'info-moisture' },
    imports: [PageModule],
    templateUrl: './info-moisture.component.html',
    styleUrl: './info-moisture.component.scss'
})
export class InfoMoistureComponent {
    public moisture?: ILaboratoryTestMoistureDTO = this.data.moisture;
    public blocks: IPageBlock[][] = [
        [
            { title: 'خالی', value: this.moisture?.empty || '' },
            { title: 'اولیه', value: this.moisture?.initial || '' },
            { title: 'نهایی', value: this.moisture?.final || '' },
        ],
        [{ title: 'نتیجه آزمایش', value: this.moisture?.result || '' }],
    ];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { moisture?: ILaboratoryTestMoistureDTO }) {}
}
