import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Helper } from '@webilix/helper-library';

import { ApiService, ILaboratoryDailyLoadRs, ILaboratoryLoadDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { LaboratoryResultInfo, LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'daily-load',
    templateUrl: './daily-load.component.html',
    styleUrl: './daily-load.component.scss',
    standalone: false
})
export class DailyLoadComponent implements OnChanges {
    @Input({ required: true }) date!: Date;

    public loading: boolean = true;
    public loads: ILaboratoryLoadDTO[] = [];

    public list: IList<ILaboratoryLoadDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            {
                title: 'بار',
                value: (data) => data.cargo.title,
                isDescription: true,
                description: (data) => LoadCargoInfo[data.cargo.type].title,
            },
            { title: 'طرف حساب', value: (data) => data.cargo.party?.title },
            { title: 'محموله', value: (data) => data.cargo.shipment?.title },
            {
                title: 'وزن',
                value: (data) => data.draft.weight,
                type: 'NUMBER',
                description: (data) => Helper.NUMBER.format(data.draft.count) + ' حواله',
            },
            { title: LaboratoryResultInfo['FE'].title, value: (data) => data.fe?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['FEO'].title, value: (data) => data.feo?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['GRIND'].title, value: (data) => data.grind?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['MOISTURE'].title, value: (data) => data.moisture?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['SULPHUR'].title, value: (data) => data.sulphur?.result, type: 'NUMBER' },
        ],
    };

    constructor(private readonly apiService: ApiService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const date: string = this.date.toJSON();
        this.apiService.request<ILaboratoryDailyLoadRs>('LaboratoryDailyLoad', { params: { date } }, (response) => {
            this.loading = false;
            this.loads = response;
        });
    }
}
