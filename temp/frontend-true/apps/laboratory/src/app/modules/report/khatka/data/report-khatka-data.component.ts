import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILaboratoryCargoPortionDTO,
    ILaboratoryExportKhatkaCargoRq,
    ILaboratoryExportKhatkaCargoRs,
    ILaboratoryKhatkaDTO,
    ILaboratoryReportKhatkaRs,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import {
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
    LaboratoryLine,
    LaboratoryLineInfo,
    LaboratoryLineList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LoadCargoInfo,
} from '@lib/shared';

@Component({
    host: { selector: 'report-khatka-data' },
    templateUrl: './report-khatka-data.component.html',
    styleUrl: './report-khatka-data.component.scss',
    standalone: false,
})
export class ReportKhatkaDataComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryLineList = LaboratoryLineList;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratoryKhatkaList = LaboratoryKhatkaList;
    public laboratoryKhatkaInfo = LaboratoryKhatkaInfo;

    public title: IPageTitle = {
        title: 'گزارش بارهای ختکا',
        actions: [{ type: 'RETURN', action: ['/report', 'khatka'] }],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public portions: ILaboratoryCargoPortionDTO[] = [];

    public blocks: IPageBlock[][] = [];
    public locations: {
        [key in LaboratoryKhatka]: {
            count: number;
            lines: { [key in LaboratoryLine]: ILaboratoryKhatkaDTO[] };
            buttons: IPageCardButton[];
        };
    } = {
        FEED: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('FEED') },
        CONCENTRATE: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('CONCENTRATE') },
        BALLMILL_1ST: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('BALLMILL_1ST') },
        BALLMILL_2ND: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('BALLMILL_2ND') },
        HYDROCYCLONE_1ST: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('HYDROCYCLONE_1ST') },
        HYDROCYCLONE_2ND: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('HYDROCYCLONE_2ND') },
        THICKENER: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('THICKENER') },
        FILTERPRESS: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('FILTERPRESS') },
    };

    private periodPipe = new NgxHelperPeriodPipe().transform;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        if (!this.ID) {
            this.router.navigate(['/report', 'khatka']);
            return;
        }

        const CARGOID: string = this.ID;
        this.apiService.request<ILaboratoryReportKhatkaRs>('LaboratoryReportKhatka', { ids: { CARGOID } }, (response) => {
            if (response.length === 0) {
                this.ngxHelperToastService.error('نتیجه آزمایش ثبت نشده است.');
                this.router.navigate(['/report', 'khatka']);
                return;
            }

            this.loading = false;
            this.portions = response[0].cargo?.portions || [];

            const dates: Date[] = response.map((c) => c.time.begin).sort((d1, d2) => d1.getTime() - d2.getTime());
            const from: Date = dates[0];
            const to: Date = dates[dates.length - 1];

            this.blocks = [
                [
                    { title: 'بار', value: response[0].cargo?.title || '' },
                    { title: 'دوره زمانی', value: this.periodPipe({ from, to }) },
                    { title: 'تعداد آزمایش', value: response.length },
                ],
                [
                    {
                        title: 'نوع بار',
                        value: response[0].cargo?.type ? LoadCargoInfo[response[0].cargo.type].title : '',
                    },
                    { title: 'طرف حساب', value: response[0].cargo?.party?.title || '' },
                    { title: 'محموله', value: response[0].cargo?.shipment?.title || '' },
                ],
            ];

            response.forEach((khatka: ILaboratoryKhatkaDTO) => {
                khatka.tests.forEach((test) => {
                    if (!test.fe && !test.feo && !test.grind && !test.moisture && !test.sulphur) return;

                    this.locations[test.test].count++;
                    this.locations[test.test].lines[khatka.line].push(khatka);
                });
            });
        });
    }

    getResult(khatka: ILaboratoryKhatkaDTO, location: LaboratoryKhatka, test: LaboratoryResult): number | null {
        const data = khatka.tests.find((t) => t.test === location);
        if (!data) return null;

        switch (test) {
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

    getButtons(khatka: LaboratoryKhatka): IPageCardButton[] {
        return ExportTypeList.map((type: ExportType) => ({
            title: ExportTypeInfo[type].title,
            icon: ExportTypeInfo[type].icon,
            action: () => this.export(khatka, type),
        }));
    }

    export(khatka: LaboratoryKhatka, type: ExportType): void {
        const CARGOID: string = this.ID;
        const body: ILaboratoryExportKhatkaCargoRq = { khatka, type };
        this.apiService.request<ILaboratoryExportKhatkaCargoRs>(
            'LaboratoryExportKhatkaCargo',
            { body, ids: { CARGOID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
