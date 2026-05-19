import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, ILaboratoryCargoPortionDTO, ILaboratoryCrusherDTO, ILaboratoryDailyCrusherRs } from '@lib/apis';
import {
    LaboratoryCrusher,
    LaboratoryCrusherInfo,
    LaboratoryCrusherList,
    LaboratoryLine,
    LaboratoryLineInfo,
    LaboratoryLineList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LaboratoryResultList,
    LoadCargoInfo,
} from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    selector: 'daily-crusher',
    templateUrl: './daily-crusher.component.html',
    styleUrl: './daily-crusher.component.scss',
    standalone: false,
})
export class DailyCrusherComponent implements OnChanges {
    @Input({ required: true }) date!: Date;
    @Input({ required: true }) view!: 'FULL' | 'GROUP';

    public loadCargoInfo = LoadCargoInfo;
    public laboratoryLineList = LaboratoryLineList;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratoryResultList = LaboratoryResultList;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryCrusherList = LaboratoryCrusherList;
    public laboratoryCrusherInfo = LaboratoryCrusherInfo;

    public loading: boolean = true;
    public crushers: ILaboratoryCrusherDTO[] = [];
    public lines: { [key in LaboratoryLine]: ILaboratoryCrusherDTO[] } = { 1: [], 2: [] };
    public cargos: {
        title: string;
        type: string;
        party: string;
        shipment: string;
        portions: ILaboratoryCargoPortionDTO[];
    }[] = [];

    public visibleGroups: string[] = [];

    private jalali = JalaliDateTime();

    constructor(private readonly apiService: ApiService, private readonly laboratoryTestService: LaboratoryTestService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const date: string = this.date.toJSON();
        this.apiService.request<ILaboratoryDailyCrusherRs>('LaboratoryDailyCrusher', { params: { date } }, (response) => {
            this.loading = false;
            this.crushers = response;

            this.lines = { 1: [], 2: [] };
            this.crushers.forEach((crusher) => this.lines[crusher.line].push(crusher));
            this.lines[1] = this.lines[1].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());
            this.lines[2] = this.lines[2].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());

            this.visibleGroups = ['CARGO'];
            this.lines[1].forEach((_, index) => this.visibleGroups.push(this.getGroup('1', index)));
            if (this.lines[1].length > 1) this.visibleGroups.push(this.getGroup('1', 'AVERAGE'));
            this.lines[2].forEach((_, index) => this.visibleGroups.push(this.getGroup('2', index)));
            if (this.lines[2].length > 1) this.visibleGroups.push(this.getGroup('2', 'AVERAGE'));

            const cargos: Map<
                string,
                { title: string; type: string; party: string; shipment: string; portions: ILaboratoryCargoPortionDTO[] }
            > = new Map<
                string,
                { title: string; type: string; party: string; shipment: string; portions: ILaboratoryCargoPortionDTO[] }
            >();
            this.crushers
                .filter((c) => !!c.cargo)
                .sort((c1, c2) => (c1.cargo?.title || '').localeCompare(c2.cargo?.title || ''))
                .forEach((c) =>
                    cargos.set(c.cargo?.id || '', {
                        title: c.cargo?.title || '',
                        type: c.cargo?.type ? LoadCargoInfo[c?.cargo.type].title : '',
                        party: c.cargo?.party?.title || '',
                        shipment: c.cargo?.shipment?.title || '',
                        portions: c.cargo?.portions || [],
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

    getGroup(line: LaboratoryLine, index: number | 'AVERAGE'): string {
        return `LINE${line}${index}`;
    }

    updateGroup(group: string, visible: boolean): void {
        if (visible) this.visibleGroups.push(group);
        else this.visibleGroups = this.visibleGroups.filter((g) => g !== group);
    }

    getTime(crusher: ILaboratoryCrusherDTO): string {
        return (
            this.jalali.toTime(crusher.time.begin, { format: 'H:I' }) +
            ' تا ' +
            this.jalali.toTime(crusher.time.end, { format: 'H:I' })
        );
    }

    getResult(crusher: ILaboratoryCrusherDTO, test: LaboratoryCrusher, result: LaboratoryResult): number | null {
        const data = crusher.tests.find((t) => t.test === test);
        if (!data) return null;

        switch (result) {
            case 'FE':
                return data.fe?.result || null;
            case 'FEO':
                return data.feo?.result || null;
            case 'GRIND':
                return data.grind?.result || null;
            case 'MOISTURE':
                return data.moisture?.result || null;
            case 'SULPHUR':
                return data.sulphur?.result || null;
        }
    }

    getAverage(line: LaboratoryLine, test: LaboratoryCrusher, result: LaboratoryResult): number | null {
        const results: number[] = this.lines[line]
            .map((crusher) => this.getResult(crusher, test, result))
            .filter((result) => result !== null);
        const fractional: number = result === 'GRIND' ? 0 : 2;
        return results.length > 0 ? +(results.reduce((sum, r) => sum + r, 0) / results.length).toFixed(fractional) : null;
    }

    showResult(crusher: ILaboratoryCrusherDTO, test: LaboratoryCrusher, result: LaboratoryResult): void {
        const data = crusher.tests.find((t) => t.test === test);
        if (!data) return;

        switch (result) {
            case 'FE':
                if (data.fe) this.laboratoryTestService.showFe(data.fe);
                break;
            case 'FEO':
                if (data.feo) this.laboratoryTestService.showFeO(data.feo);
                break;
            case 'GRIND':
                if (data.grind) this.laboratoryTestService.showGrind(data.grind);
                break;
            case 'MOISTURE':
                if (data.moisture) this.laboratoryTestService.showMoisture(data.moisture);
                break;
        }
    }
}
