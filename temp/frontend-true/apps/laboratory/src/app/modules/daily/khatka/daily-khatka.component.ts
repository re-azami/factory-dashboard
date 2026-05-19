import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ApiService, ILaboratoryCargoPortionDTO, ILaboratoryDailyKhatkaRs, ILaboratoryKhatkaDTO } from '@lib/apis';
import {
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
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
    selector: 'daily-khatka',
    templateUrl: './daily-khatka.component.html',
    styleUrl: './daily-khatka.component.scss',
    standalone: false,
})
export class DailyKhatkaComponent implements OnChanges {
    @Input({ required: true }) date!: Date;
    @Input({ required: true }) view!: 'FULL' | 'GROUP';

    public loadCargoInfo = LoadCargoInfo;
    public laboratoryLineList = LaboratoryLineList;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratoryResultList = LaboratoryResultList;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryKhatkaList = LaboratoryKhatkaList;
    public laboratoryKhatkaInfo = LaboratoryKhatkaInfo;

    public loading: boolean = true;
    public khatkas: ILaboratoryKhatkaDTO[] = [];
    public lines: { [key in LaboratoryLine]: ILaboratoryKhatkaDTO[] } = { 1: [], 2: [] };
    public cargos: {
        title: string;
        type: string;
        party: string;
        shipment: string;
        portions: ILaboratoryCargoPortionDTO[];
    }[] = [];
    public footer: (string | number | null)[][] = [];

    public visibleGroups: string[] = [];

    private jalali = JalaliDateTime();

    constructor(private readonly apiService: ApiService, private readonly laboratoryTestService: LaboratoryTestService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const date: string = this.date.toJSON();
        this.apiService.request<ILaboratoryDailyKhatkaRs>('LaboratoryDailyKhatka', { params: { date } }, (response) => {
            this.loading = false;
            this.khatkas = response;

            this.lines = { 1: [], 2: [] };
            this.khatkas.forEach((khatkas) => this.lines[khatkas.line].push(khatkas));
            this.lines[1] = this.lines[1].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());
            this.lines[2] = this.lines[2].sort((l1, l2) => l1.time.begin.getTime() - l2.time.begin.getTime());

            this.visibleGroups = ['CARGO', 'CALCULATION'];
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
            this.khatkas
                .filter((k) => !!k.cargo)
                .sort((k1, k2) => (k1.cargo?.title || '').localeCompare(k2.cargo?.title || ''))
                .forEach((k) =>
                    cargos.set(k.cargo?.id || '', {
                        title: k.cargo?.title || '',
                        type: k.cargo?.type ? LoadCargoInfo[k?.cargo.type].title : '',
                        party: k.cargo?.party?.title || '',
                        shipment: k.cargo?.shipment?.title || '',
                        portions: k.cargo?.portions || [],
                    }),
                );

            this.cargos = [];
            [...cargos.keys()].forEach((id: string) => {
                const cargo = cargos.get(id);
                if (!cargo) return;

                this.cargos.push(cargo);
            });

            this.footer = [];

            const getTotalWeight = (type: keyof ILaboratoryKhatkaDTO['tonnage']): number | null => {
                const values: number[] = this.khatkas.map((k) => k.tonnage[type] || 0).filter((v) => v !== 0);
                return values.length < 2 ? null : values.reduce((sum: number, v) => sum + v, 0);
            };
            const totalWeight = { feed: getTotalWeight('feed'), product: getTotalWeight('product') };
            if (totalWeight.feed || totalWeight.product)
                this.footer.push(['مجموع', totalWeight.feed, totalWeight.product, null, null, null]);

            const getAverageWeight = (callback: (khatka: ILaboratoryKhatkaDTO) => number | null): number | null => {
                let count: number = 0;
                let total: number = 0;
                let tonnage: number = 0;
                this.khatkas.forEach((k) => {
                    const value = callback(k);
                    const feed = k.tonnage.feed;
                    if (!value || !feed) return;

                    count++;
                    total += value * feed;
                    tonnage += feed;
                });

                return count < 2 || tonnage === 0 || total === 0 ? null : +(total / tonnage).toFixed(2);
            };
            const averageWeight = {
                efficiency: getAverageWeight(this.getEfficiency.bind(this)),
                weight: getAverageWeight(this.getWeight.bind(this)),
            };
            if (averageWeight.efficiency || averageWeight.weight) {
                if (this.footer.length === 0)
                    this.footer.push([null, null, null, 'میانگین وزنی', averageWeight.efficiency, averageWeight.weight]);
                else {
                    this.footer[0][3] = 'میانگین وزنی';
                    this.footer[0][4] = averageWeight.efficiency;
                    this.footer[0][5] = averageWeight.weight;
                }
            }

            const getAverageSum = (callback: (khatka: ILaboratoryKhatkaDTO) => number | null): number | null => {
                const values: number[] = this.khatkas.map((k) => callback(k) || 0).filter((v) => v !== 0);
                return values.length < 2
                    ? null
                    : +(values.reduce((sum: number, v) => sum + v, 0) / values.length).toFixed(2);
            };
            const averageSum = {
                efficiency: getAverageSum(this.getEfficiency.bind(this)),
                weight: getAverageSum(this.getWeight.bind(this)),
            };
            if (averageSum.efficiency || averageSum.weight) {
                if (this.footer.length === 0 || this.footer[0][3] !== null)
                    this.footer.push([null, null, null, 'میانگین حسابی', averageSum.efficiency, averageSum.weight]);
                else {
                    this.footer[0][3] = 'میانگین حسابی';
                    this.footer[0][4] = averageSum.efficiency;
                    this.footer[0][5] = averageSum.weight;
                }
            }
        });
    }

    getGroup(line: LaboratoryLine, index: number | 'AVERAGE'): string {
        return `LINE${line}${index}`;
    }

    updateGroup(group: string, visible: boolean): void {
        if (visible) this.visibleGroups.push(group);
        else this.visibleGroups = this.visibleGroups.filter((g) => g !== group);
    }

    getSeparation(khatka: ILaboratoryKhatkaDTO): number | null {
        const feed = khatka.tests.find((t) => t.test === 'FEED')?.fe?.result;
        const concentrate = khatka.tests.find((t) => t.test === 'CONCENTRATE')?.fe?.result;
        const thickener = khatka.tests.find((t) => t.test === 'THICKENER')?.fe?.result;

        return feed && concentrate && thickener
            ? +(
                  ((concentrate * (feed - thickener) * (concentrate - feed) * (100 - thickener)) /
                      (feed * Math.pow(concentrate - thickener, 2) * (100 - feed))) *
                  100
              ).toFixed(2)
            : null;
    }

    getEfficiency(khatka: ILaboratoryKhatkaDTO): number | null {
        const feed = khatka.tests.find((t) => t.test === 'FEED')?.fe?.result;
        const concentrate = khatka.tests.find((t) => t.test === 'CONCENTRATE')?.fe?.result;
        const thickener = khatka.tests.find((t) => t.test === 'THICKENER')?.fe?.result;

        return feed && concentrate && thickener
            ? +(((feed - thickener) / (concentrate - thickener)) * 100).toFixed(2)
            : null;
    }

    getWeight(khatka: ILaboratoryKhatkaDTO): number | null {
        const testFeed = khatka.tests.find((t) => t.test === 'FEED')?.moisture?.result;
        const testConcentrate = khatka.tests.find((t) => t.test === 'CONCENTRATE')?.moisture?.result;
        if (!testFeed || !testConcentrate) return null;

        const tonnageFeed = khatka.tonnage?.feed;
        const tonnageProduct = khatka.tonnage?.product;
        if (!tonnageFeed || !tonnageProduct) return null;

        return +(
            ((tonnageProduct - (tonnageProduct * testConcentrate) / 100) / (tonnageFeed - (tonnageFeed * testFeed) / 100)) *
            100
        ).toFixed(2);
    }

    getTime(khatka: ILaboratoryKhatkaDTO): string {
        return (
            this.jalali.toTime(khatka.time.begin, { format: 'H:I' }) +
            ' تا ' +
            this.jalali.toTime(khatka.time.end, { format: 'H:I' })
        );
    }

    getResult(khatka: ILaboratoryKhatkaDTO, test: LaboratoryKhatka, result: LaboratoryResult): number | null {
        const data = khatka.tests.find((t) => t.test === test);
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

    getAverage(line: LaboratoryLine, test: LaboratoryKhatka, result: LaboratoryResult): number | null {
        const results: number[] = this.lines[line]
            .map((khatka) => this.getResult(khatka, test, result))
            .filter((result) => result !== null);
        const fractional: number = result === 'GRIND' ? 0 : 2;
        return results.length > 0 ? +(results.reduce((sum, r) => sum + r, 0) / results.length).toFixed(fractional) : null;
    }

    getTonnage(line: LaboratoryLine, test: LaboratoryKhatka): number | null {
        if (this.lines[line].length === 0) return null;

        switch (test) {
            case 'FEED':
                const feeds: number[] = this.lines[line]
                    .map((khatka) => khatka.tonnage?.feed || null)
                    .filter((feed) => feed !== null);
                return feeds.length > 0 ? +(feeds.reduce((sum, f) => sum + f, 0) / feeds.length).toFixed(0) : null;

            case 'CONCENTRATE':
                const products: number[] = this.lines[line]
                    .map((khatka) => khatka.tonnage?.product || null)
                    .filter((product) => product !== null);
                return products.length > 0 ? +(products.reduce((sum, p) => sum + p, 0) / products.length).toFixed(0) : null;

            default:
                return null;
        }
    }

    showResult(khatka: ILaboratoryKhatkaDTO, test: LaboratoryKhatka, result: LaboratoryResult): void {
        const data = khatka.tests.find((t) => t.test === test);
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
