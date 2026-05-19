import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { ApiService, ILaboratoryReportAverageRs } from '@lib/apis';
import {
    LaboratoryCrusher,
    LaboratoryCrusherInfo,
    LaboratoryCrusherList,
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
    LaboratoryResult,
} from '@lib/shared';

@Component({
    selector: 'report-average-test',
    templateUrl: './report-average-test.component.html',
    styleUrl: './report-average-test.component.scss',
    standalone: false
})
export class ReportAverageTestComponent implements OnChanges {
    @Input({ required: true }) from!: Date;
    @Input({ required: true }) to!: Date;
    @Input({ required: true }) test!: LaboratoryResult;

    public loading: boolean = true;
    public data: {
        title: string;
        icon: string;
        tests: { title: string; count: number; minimum: number; maximum: number; average: number }[];
    }[] = [];

    constructor(private readonly apiService: ApiService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILaboratoryReportAverageRs>(
            'LaboratoryReportAverage',
            { params: { from, to, test: this.test } },
            (response) => {
                this.loading = false;
                this.data = [
                    {
                        title: 'سنگ شکن',
                        icon: 'hardware',
                        tests: LaboratoryCrusherList.map((crusher: LaboratoryCrusher) => {
                            const data = response.crushers.find((c) => c.crusher === crusher);
                            return {
                                title: LaboratoryCrusherInfo[crusher].title,
                                count: data?.count || 0,
                                minimum: data?.minimum || 0,
                                maximum: data?.maximum || 0,
                                average: data?.average || 0,
                            };
                        }),
                    },
                    {
                        title: 'ختکا',
                        icon: 'terrain',
                        tests: LaboratoryKhatkaList.map((khatka: LaboratoryKhatka) => {
                            const data = response.khatkas.find((k) => k.khatka === khatka);
                            return {
                                title: LaboratoryKhatkaInfo[khatka].title,
                                count: data?.count || 0,
                                minimum: data?.minimum || 0,
                                maximum: data?.maximum || 0,
                                average: data?.average || 0,
                            };
                        }),
                    },
                ];
            },
        );
    }
}
