import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    selector: 'draft-report-table',
    imports: [CommonModule],
    templateUrl: './draft-report-table.component.html',
    styleUrl: './draft-report-table.component.scss'
})
export class DraftReportTableComponent implements OnChanges {
    @Input({ required: false }) parties: { id: string; title: string; count: number; weight: number }[] = [];
    @Input({ required: false }) shipments: { id: string; title: string; count: number; weight: number }[] = [];
    @Input({ required: false }) transporters: { id: string; title: string; count: number; weight: number }[] = [];
    @Input({ required: false }) cargos: { id: string; title: string; type: LoadCargo; count: number; weight: number }[] = [];
    @Input({ required: false }) owners: { id: string; name: string; count: number; weight: number }[] = [];

    public loadCargoList = LoadCargoList;
    public loadCargoInfo = LoadCargoInfo;

    public types!: { [key in LoadCargo]: { count: number; weight: number } };

    ngOnChanges(changes: SimpleChanges): void {
        this.types = {
            OUT: { count: 0, weight: 0 },
            IN: { count: 0, weight: 0 },
            BUY: { count: 0, weight: 0 },
            SITE: { count: 0, weight: 0 },
        };
        this.cargos.forEach((c) => {
            this.types[c.type].count += c.count;
            this.types[c.type].weight += c.weight;
        });
    }
}
