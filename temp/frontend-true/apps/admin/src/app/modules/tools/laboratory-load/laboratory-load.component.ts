import { Component } from '@angular/core';

import { NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperCalendarValue } from '@webilix/ngx-helper/calendar';

import { ApiService, ILaboratoryLoadListRs, ILoadReportDraftRs, IOkDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { LoadCargo, LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'laboratory-load' },
    standalone: false,
    templateUrl: './laboratory-load.component.html',
    styleUrl: './laboratory-load.component.scss',
})
export class LaboratoryLoadComponent {
    public title: IPageTitle = {
        title: 'مغایرت بارهای آزمایشگاه',
        actions: [{ title: 'بروزرسانی', icon: 'autorenew', color: 'primary', action: this.update.bind(this) }],
        toolbar: {
            route: ['/tools', 'laboratory-load'],
            calendar: { types: ['DAY'], maxDate: new Date() },
        },
    };

    public loadCargoInfo = LoadCargoInfo;

    public loading: boolean = true;
    public report: {
        id: string;
        title: string;
        type: LoadCargo;
        load: { count: number; weight: number };
        laboratory: { count: number; weight: number };
        hasConflict: boolean;
    }[] = [];

    private from?: Date;
    private to?: Date;

    private loadReport?: ILoadReportDraftRs;
    private laboratoryReport?: ILaboratoryLoadListRs;

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    setDate(values: INgxHelperCalendarValue): void {
        this.from = values.period.from;
        this.to = values.period.to;

        this.loadConflict();
    }

    loadConflict(): void {
        if (!this.from || !this.to) return;

        this.loadReport = undefined;
        this.loadLoad();

        this.laboratoryReport = undefined;
        this.loadLaboratory();
    }

    setReport(): void {
        if (!this.loadReport || !this.laboratoryReport) return;

        const cargos: { id: string; title: string; type: LoadCargo }[] = [];
        this.loadReport.cargos.forEach((cargo) => {
            if (cargo.type !== 'SITE') cargos.push({ id: cargo.id, title: cargo.title, type: cargo.type });
        });
        this.laboratoryReport.list.forEach((cargo) => {
            if (cargo.cargo.type !== 'SITE' && !cargos.find((c) => c.id === cargo.cargo.id))
                cargos.push({ id: cargo.cargo.id, title: cargo.cargo.title, type: cargo.cargo.type });
        });

        this.loading = false;
        this.report = cargos
            .sort((c1, c2) => c1.title.localeCompare(c2.title))
            .map((cargo) => {
                const load = this.loadReport?.cargos.find((c) => c.id === cargo.id);
                const laboratory = this.laboratoryReport?.list.find((c) => c.cargo.id === cargo.id);
                return {
                    ...cargo,
                    load: { count: load?.count || 0, weight: load?.weight || 0 },
                    laboratory: { count: laboratory?.draft?.count || 0, weight: laboratory?.draft?.weight || 0 },
                    hasConflict: load?.count !== laboratory?.draft?.count || load?.weight !== laboratory?.draft?.weight,
                };
            });
    }

    loadLoad(): void {
        if (!this.from || !this.to) return;

        const from: string = this.from.toJSON();
        const to: string = this.to.toJSON();
        this.apiService.request<ILoadReportDraftRs>('LoadReportDraft', { params: { from, to } }, (response) => {
            this.loadReport = response;
            this.setReport();
        });
    }

    loadLaboratory(): void {
        if (!this.from) return;

        const party: string = '';
        const shipment: string = '';
        const date: string = this.from.toJSON() || '';
        const page: string = '1';
        this.apiService.request<ILaboratoryLoadListRs>(
            'LaboratoryLoadList',
            { params: { party, shipment, date, page } },
            (response) => {
                this.laboratoryReport = response;
                this.setReport();
            },
        );
    }

    update(): void {
        if (!this.from) return;

        const date: string = this.from.toJSON() || '';
        this.apiService.request<IOkDTO>('SharedLoadCaboratoryConflict', { params: { date } }, (response) => {
            this.ngxHelperToastService.success('اطلاعات با موفقیت بروزرسانی شد');
            this.loadConflict();
        });
    }
}
