import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ILaboratoryCargoPortionDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'cargo-portion' },
    imports: [],
    templateUrl: './cargo-portion.component.html',
    styleUrl: './cargo-portion.component.scss'
})
export class CargoPortionComponent implements OnInit, OnDestroy {
    public loadCargoInfo = LoadCargoInfo;

    public title: string = this.data.title;
    public portions: ILaboratoryCargoPortionDTO[] = this.data.portions;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { title: string; portions: ILaboratoryCargoPortionDTO[] },
    ) {}

    ngOnInit(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '800px');
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
    }
}
