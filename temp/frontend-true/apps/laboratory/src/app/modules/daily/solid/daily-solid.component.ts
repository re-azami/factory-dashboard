import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, ILaboratoryCargoPortionDTO, ILaboratoryDailySolidRs, ILaboratorySolidDTO } from '@lib/apis';
import {
    LaboratoryLine,
    LaboratoryLineInfo,
    LaboratorySolid,
    LaboratorySolidInfo,
    LaboratorySolidList,
    LoadCargoInfo,
} from '@lib/shared';

@Component({
    selector: 'daily-solid',
    templateUrl: './daily-solid.component.html',
    styleUrl: './daily-solid.component.scss',
    standalone: false
})
export class DailySolidComponent implements OnChanges {
    @Input({ required: true }) date!: Date;

    public loadCargoInfo = LoadCargoInfo;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratorySolidList = LaboratorySolidList;
    public laboratorySolidInfo = LaboratorySolidInfo;

    public loading: boolean = true;
    public solids: ILaboratorySolidDTO[] = [];
    public lines: { [key in LaboratoryLine]: ILaboratorySolidDTO[] } = { 1: [], 2: [] };
    public cargos: {
        title: string;
        type: string;
        party: string;
        shipment: string;
        portions: ILaboratoryCargoPortionDTO[];
    }[] = [];

    private jalali = JalaliDateTime();

    constructor(private readonly apiService: ApiService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const date: string = this.date.toJSON();
        this.apiService.request<ILaboratoryDailySolidRs>('LaboratoryDailySolid', { params: { date } }, (response) => {
            this.loading = false;
            this.solids = response;

            this.lines = { 1: [], 2: [] };
            this.solids.forEach((solid) => this.lines[solid.line].push(solid));
            this.lines[1] = this.lines[1].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());
            this.lines[2] = this.lines[2].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());

            const cargos: Map<
                string,
                { title: string; type: string; party: string; shipment: string; portions: ILaboratoryCargoPortionDTO[] }
            > = new Map<
                string,
                { title: string; type: string; party: string; shipment: string; portions: ILaboratoryCargoPortionDTO[] }
            >();
            this.solids
                .filter((s) => !!s.cargo)
                .sort((s1, s2) => (s1.cargo?.title || '').localeCompare(s2.cargo?.title || ''))
                .forEach((s) =>
                    cargos.set(s.cargo?.id || '', {
                        title: s.cargo?.title || '',
                        type: s.cargo?.type ? LoadCargoInfo[s?.cargo.type].title : '',
                        party: s.cargo?.party?.title || '',
                        shipment: s.cargo?.shipment?.title || '',
                        portions: s.cargo?.portions || [],
                    }),
                );

            this.cargos = [];
            [...cargos.keys()].forEach((id: string) => {
                const cargo = cargos.get(id);
                if (!cargo) return;

                this.cargos.push(cargo);
            });
        });
    }

    getTime(solid: ILaboratorySolidDTO): string {
        return (
            this.jalali.toTime(solid.time.begin, { format: 'H:I' }) +
            ' تا ' +
            this.jalali.toTime(solid.time.end, { format: 'H:I' })
        );
    }

    getResult(solid: ILaboratorySolidDTO, test: LaboratorySolid): number | null {
        const data = solid.tests.find((s) => s.test === test);
        return data?.result || null;
    }

    showResult(solid: ILaboratorySolidDTO, test: LaboratorySolid): void {}
}
