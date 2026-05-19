import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ApiService, ILaboratoryBlaineDTO, ILaboratoryDailyBlaineRs } from '@lib/apis';
import { IList } from '@lib/list';
import { LaboratoryLineInfo, LoadCargoInfo } from '@lib/shared';

import { LaboratoryCargoService, LaboratoryTestService } from '../../../providers';

@Component({
    selector: 'daily-blaine',
    templateUrl: './daily-blaine.component.html',
    styleUrl: './daily-blaine.component.scss',
    standalone: false
})
export class DailyBlaineComponent implements OnChanges {
    @Input({ required: true }) date!: Date;

    public loading: boolean = true;
    public blaines: ILaboratoryBlaineDTO[] = [];

    public list: IList<ILaboratoryBlaineDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            { title: 'خط', value: (data) => LaboratoryLineInfo[data.line].title },
            { title: 'شروع', value: (data) => data.time.begin, type: 'DATE', format: 'H:I' },
            {
                title: 'پایان',
                value: (data) => data.time.end,
                type: 'DATE',
                format: 'H:I',
                description: (data) => this.laboratoryTestService.getTimeDescription(data.time.begin, data.time.end),
            },
            {
                title: 'بار',
                value: (data) => data.cargo?.title,
                description: (data) => (data.cargo?.type ? LoadCargoInfo[data.cargo.type].title : undefined),
                english: (data) => !!data.cargo && data.cargo.portions.length > 0,
                action: (data) =>
                    !!data.cargo && data.cargo.portions.length > 0
                        ? () => this.laboratoryCargoService.showMixed(data.cargo?.title || '', data.cargo?.portions || [])
                        : [],
            },
            { title: 'طرف حساب', value: (data) => data.cargo?.party?.title },
            { title: 'محموله', value: (data) => data.cargo?.shipment?.title },
            { title: 'نتیجه', value: 'result', type: 'NUMBER' },
        ],
    };

    constructor(
        private readonly apiService: ApiService,
        private readonly laboratoryCargoService: LaboratoryCargoService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        const date: string = this.date.toJSON();
        this.apiService.request<ILaboratoryDailyBlaineRs>('LaboratoryDailyBlaine', { params: { date } }, (response) => {
            this.loading = false;
            this.blaines = response;
        });
    }
}
