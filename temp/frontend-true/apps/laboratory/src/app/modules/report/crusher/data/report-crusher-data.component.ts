import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPeriodPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILaboratoryCargoPortionDTO,
    ILaboratoryCrusherDTO,
    ILaboratoryExportCrusherCargoRq,
    ILaboratoryExportCrusherCargoRs,
    ILaboratoryReportCrusherRs,
} from '@lib/apis';
import { IPageBlock, IPageCardButton, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import {
    ExportType,
    ExportTypeInfo,
    ExportTypeList,
    LaboratoryCrusher,
    LaboratoryCrusherInfo,
    LaboratoryCrusherList,
    LaboratoryLine,
    LaboratoryLineInfo,
    LaboratoryLineList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LoadCargoInfo,
} from '@lib/shared';

@Component({
    host: { selector: 'report-crusher-data' },
    templateUrl: './report-crusher-data.component.html',
    styleUrl: './report-crusher-data.component.scss',
    standalone: false,
})
export class ReportCrusherDataComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;
    public laboratoryResultInfo = LaboratoryResultInfo;
    public laboratoryLineList = LaboratoryLineList;
    public laboratoryLineInfo = LaboratoryLineInfo;
    public laboratoryCrusherList = LaboratoryCrusherList;
    public laboratoryCrusherInfo = LaboratoryCrusherInfo;

    public title: IPageTitle = {
        title: 'گزارش بارهای سنگ شکن',
        actions: [{ type: 'RETURN', action: ['/report', 'crusher'] }],
    };

    public ID: string = this.activatedRoute.snapshot.params['ID'];
    public loading: boolean = true;
    public portions: ILaboratoryCargoPortionDTO[] = [];

    public blocks: IPageBlock[][] = [];
    public locations: {
        [key in LaboratoryCrusher]: {
            count: number;
            lines: { [key in LaboratoryLine]: ILaboratoryCrusherDTO[] };
            buttons: IPageCardButton[];
        };
    } = {
        CRUSHER: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('CRUSHER') },
        FEED: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('FEED') },
        CONCENTRATE: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('CONCENTRATE') },
        MIDDLE: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('MIDDLE') },
        TAIL: { count: 0, lines: { 1: [], 2: [] }, buttons: this.getButtons('TAIL') },
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
            this.router.navigate(['/report', 'crusher']);
            return;
        }

        const CARGOID: string = this.ID;
        this.apiService.request<ILaboratoryReportCrusherRs>('LaboratoryReportCrusher', { ids: { CARGOID } }, (response) => {
            if (response.length === 0) {
                this.ngxHelperToastService.error('نتیجه آزمایش ثبت نشده است.');
                this.router.navigate(['/report', 'crusher']);
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

            response.forEach((crusher: ILaboratoryCrusherDTO) => {
                crusher.tests.forEach((test) => {
                    if (!test.fe && !test.feo && !test.grind && !test.moisture && !test.sulphur) return;

                    this.locations[test.test].count++;
                    this.locations[test.test].lines[crusher.line].push(crusher);
                });
            });
        });
    }

    getResult(crusher: ILaboratoryCrusherDTO, location: LaboratoryCrusher, test: LaboratoryResult): number | null {
        const data = crusher.tests.find((t) => t.test === location);
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

    getButtons(crusher: LaboratoryCrusher): IPageCardButton[] {
        return ExportTypeList.map((type: ExportType) => ({
            title: ExportTypeInfo[type].title,
            icon: ExportTypeInfo[type].icon,
            action: () => this.export(crusher, type),
        }));
    }

    export(crusher: LaboratoryCrusher, type: ExportType): void {
        const CARGOID: string = this.ID;
        const body: ILaboratoryExportCrusherCargoRq = { crusher, type };
        this.apiService.request<ILaboratoryExportCrusherCargoRs>(
            'LaboratoryExportCrusherCargo',
            { body, ids: { CARGOID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
