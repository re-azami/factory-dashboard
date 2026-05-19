import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILaboratoryExportLoadRq,
    ILaboratoryExportLoadRs,
    ILaboratoryLoadDTO,
    ILaboratoryReportLoadRs,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService, SettingService } from '@lib/providers';
import {
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LoadCargoInfo,
} from '@lib/shared';

@Component({
    host: { selector: 'report-load-data' },
    templateUrl: './report-load-data.component.html',
    styleUrl: './report-load-data.component.scss',
    standalone: false,
})
export class ReportLoadDataComponent implements OnInit {
    public laboratoryResultInfo = LaboratoryResultInfo;

    public title: IPageTitle = {
        title: 'گزارش بارهای روزانه',
        actions: [{ type: 'RETURN', action: ['/report', 'load'] }],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public loads: ILaboratoryLoadDTO[] = [];
    public dateFormat: string = this.settingService.laboratory.dailyDate === 'TITLE' ? 'W، d N Y' : 'Y-M-D';

    public dateButtons: IPageCardButton[] = [
        {
            title: 'همه موارد',
            icon: 'done_outline',
            action: () => {
                this.dates.from = this.dates.list[0].date;
                this.dates.to = this.dates.list[this.dates.list.length - 1].date;
            },
        },
    ];
    public dates: { from: Date; to: Date; list: { date: Date; title: string }[]; show: boolean } = {
        from: new Date(),
        to: new Date(),
        list: [],
        show: true,
    };

    public buttons: IPageCardButton[] = ExportTypeList.map((type: ExportType) => ({
        title: ExportTypeInfo[type].title,
        icon: ExportTypeInfo[type].icon,
        action: () => this.export(type),
    }));
    public blocks: IPageBlock[][] = [];

    private periodPipe = new NgxHelperPeriodPipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly settingService: SettingService,
    ) {}

    ngOnInit(): void {
        if (!this.ID) {
            this.router.navigate(['/report', 'load']);
            return;
        }

        const CARGOID: string = this.ID;
        this.apiService.request<ILaboratoryReportLoadRs>('LaboratoryReportLoad', { ids: { CARGOID } }, (response) => {
            if (response.length === 0) {
                this.ngxHelperToastService.error('نتیجه آزمایش ثبت نشده است.');
                this.router.navigate(['/report', 'load']);
                return;
            }

            this.loading = false;
            this.loads = response;

            const dates: Date[] = this.loads.map((l) => l.date).sort((d1, d2) => d1.getTime() - d2.getTime());
            const from: Date = dates[0];
            const to: Date = dates[dates.length - 1];

            const jalali = JalaliDateTime();
            this.dates = {
                from,
                to,
                list: dates.map((date) => ({ date, title: jalali.toTitle(date, { format: this.dateFormat }) })),
                show: false,
            };

            this.setBlocks();
        });
    }

    setBlocks(): void {
        const loads = this.loads.filter(
            (load) => load.date.getTime() >= this.dates.from.getTime() && load.date.getTime() <= this.dates.to.getTime(),
        );

        this.blocks = [
            [
                { title: 'بار', value: this.loads[0].cargo.title },
                { title: 'نوع بار', value: LoadCargoInfo[this.loads[0].cargo.type].title },
            ],
            [
                { title: 'طرف حساب', value: this.loads[0].cargo.party?.title || '' },
                { title: 'محموله', value: this.loads[0].cargo.shipment?.title || '' },
            ],
            [
                { title: 'دوره زمانی', value: this.periodPipe({ from: this.dates.from, to: this.dates.to }) },
                { title: 'تعداد روز', value: loads.length },
            ],
            [
                { title: 'تعداد حواله', value: loads.reduce((sum: number, l) => sum + l.draft.count, 0) },
                { title: 'وزن حواله‌ها', value: loads.reduce((sum: number, l) => sum + l.draft.weight, 0) },
            ],
        ];
    }

    getResult(load: ILaboratoryLoadDTO, result: LaboratoryResult): number | null {
        switch (result) {
            case 'FE':
                return load.fe ? load.fe.result : null;
            case 'FEO':
                return load.feo ? load.feo.result : null;
            case 'GRIND':
                return load.grind ? load.grind.result : null;
            case 'MOISTURE':
                return load.moisture ? load.moisture.result : null;
            case 'SULPHUR':
                return load.sulphur ? load.sulphur.result : null;
        }
    }

    getWeight(result: LaboratoryResult): number | null {
        if (this.loads.length === 0) return null;

        const values: number[] = [];
        const weights: number[] = [];
        this.loads.forEach((load: ILaboratoryLoadDTO) => {
            // CHECK DATES
            if (load.date.getTime() < this.dates.from.getTime() || load.date.getTime() > this.dates.to.getTime()) return;

            const value: number | null = this.getResult(load, result);
            if (value === null) return;

            values.push(value * load.draft.weight);
            weights.push(load.draft.weight);
        });
        if (values.length === 0) return null;

        const vSum: number = values.reduce((sum: number, v) => sum + v, 0);
        const wSum: number = weights.reduce((sum: number, w) => sum + w, 0);
        return +(vSum / wSum).toFixed(2);
    }

    getAverage(result: LaboratoryResult): number | null {
        if (this.loads.length === 0) return null;

        const values: number[] = [];
        this.loads.forEach((load: ILaboratoryLoadDTO) => {
            // CHECK DATES
            if (load.date.getTime() < this.dates.from.getTime() || load.date.getTime() > this.dates.to.getTime()) return;

            const value: number | null = this.getResult(load, result);
            if (value !== null) values.push(value);
        });
        if (values.length === 0) return null;

        const vSum: number = values.reduce((sum: number, v) => sum + v, 0);
        return +(vSum / values.length).toFixed(2);
    }

    export(type: ExportType): void {
        const CARGOID: string = this.ID;
        const body: ILaboratoryExportLoadRq = {
            from: this.dates.from,
            to: this.dates.to,
            type,
        };
        this.apiService.request<ILaboratoryExportLoadRs>('LaboratoryExportLoad', { body, ids: { CARGOID } }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
