import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormInputs, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperHttpService } from '@webilix/ngx-helper';

import { ApiService, ILoadExportDraftRq, ILoadExportDraftRs } from '@lib/apis';
import { PageModule } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList, LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    selector: 'draft-report-export',
    imports: [NgxFormModule, PageModule],
    templateUrl: './draft-report-export.component.html',
    styleUrl: './draft-report-export.component.scss'
})
export class DraftReportExportComponent implements OnChanges {
    @Input({ required: false }) description?: string;
    @Input({ required: true }) loading: boolean = true;
    @Input({ required: true }) from!: Date;
    @Input({ required: true }) to!: Date;

    @Input({ required: false }) party?: string;
    @Input({ required: false }) shipment?: string;
    @Input({ required: false }) transporter?: string;
    @Input({ required: false }) cargo?: string;
    @Input({ required: false }) owner?: string;
    @Input({ required: false }) plate: string | null = null;

    @Input({ required: false }) parties?: { id: string; title: string; count: number; weight: number }[];
    @Input({ required: false }) shipments?: { id: string; title: string; count: number; weight: number }[];
    @Input({ required: false }) transporters?: { id: string; title: string; count: number; weight: number }[];
    @Input({ required: false }) cargos?: { id: string; title: string; type: LoadCargo; count: number; weight: number }[];
    @Input({ required: false }) owners?: { id: string; name: string; count: number; weight: number }[];

    public ngxFormEmpty: INgxForm = { submit: 'دانلود', inputs: [] };
    public ngxForm: INgxForm = { submit: 'دانلود', inputs: [] };

    private types!: { [key in LoadCargo]: { count: number; weight: number } };

    constructor(
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.types = {
            OUT: { count: 0, weight: 0 },
            IN: { count: 0, weight: 0 },
            BUY: { count: 0, weight: 0 },
            SITE: { count: 0, weight: 0 },
        };
        if (this.cargos !== undefined)
            this.cargos.forEach((c) => {
                this.types[c.type].count += c.count;
                this.types[c.type].weight += c.weight;
            });

        this.setEmptyForm();
        this.setForm();

        const input: NgxFormInputs = {
            name: 'type',
            type: 'SELECT',
            title: 'نوع خروجی',
            value: 'EXCEL',
            options: ExportTypeList.map((type: ExportType) => ({ id: type, title: ExportTypeInfo[type].title })),
        };

        this.ngxFormEmpty.inputs.push(input);
        this.ngxForm.inputs.push(input);
    }

    setEmptyForm(): void {
        const inputs: NgxFormInputs[] = [];

        if (this.parties !== undefined)
            inputs.push({ name: 'parties', type: 'MULTI-SELECT', title: 'طرف حساب', options: [], view: 'SELECT' });

        if (this.shipments !== undefined)
            inputs.push({ name: 'shipments', type: 'MULTI-SELECT', title: 'محموله', options: [], view: 'SELECT' });

        if (this.transporters !== undefined)
            inputs.push({ name: 'transporters', type: 'MULTI-SELECT', title: 'باربری', options: [], view: 'SELECT' });

        if (this.cargos !== undefined)
            inputs.push({ name: 'types', type: 'MULTI-SELECT', title: 'نوع بار', options: [], view: 'SELECT' });

        if (this.cargos !== undefined)
            inputs.push({ name: 'cargos', type: 'MULTI-SELECT', title: 'بار', options: [], view: 'SELECT' });

        if (this.owners !== undefined)
            inputs.push({ name: 'owners', type: 'MULTI-SELECT', title: 'مالک', options: [], view: 'SELECT' });

        this.ngxFormEmpty.inputs = [];
        while (inputs.length > 0) this.ngxFormEmpty.inputs.push(inputs.splice(0, 2));
    }

    setForm(): void {
        const inputs: NgxFormInputs[] = [];

        if (this.parties !== undefined)
            inputs.push({
                name: 'parties',
                type: 'MULTI-SELECT',
                title: 'طرف حساب',
                options: this.parties.map((p) => ({ id: p.id, title: p.title })),
                view: 'SELECT',
                disableOn: () => this.parties?.length === 0,
            });

        if (this.shipments !== undefined)
            inputs.push({
                name: 'shipments',
                type: 'MULTI-SELECT',
                title: 'محموله',
                options: this.shipments.map((s) => ({ id: s.id, title: s.title })),
                view: 'SELECT',
                disableOn: () => this.shipments?.length === 0,
            });

        if (this.transporters !== undefined)
            inputs.push({
                name: 'transporters',
                type: 'MULTI-SELECT',
                title: 'باربری',
                options: this.transporters.map((t) => ({ id: t.id, title: t.title })),
                view: 'SELECT',
                disableOn: () => this.transporters?.length === 0,
            });

        if (this.cargos !== undefined)
            inputs.push({
                name: 'types',
                type: 'MULTI-SELECT',
                title: 'نوع بار',
                options: LoadCargoList.filter((cargo: LoadCargo) => this.types[cargo].count !== 0).map(
                    (cargo: LoadCargo) => ({ id: cargo, title: LoadCargoInfo[cargo].title }),
                ),
                view: 'SELECT',
                disableOn: () => this.cargos?.length === 0,
            });

        if (this.cargos !== undefined)
            inputs.push({
                name: 'cargos',
                type: 'MULTI-SELECT',
                title: 'بار',
                options: this.cargos.map((c) => ({ id: c.id, title: c.title })),
                view: 'SELECT',
                disableOn: () => this.cargos?.length === 0,
            });

        if (this.owners !== undefined)
            inputs.push({
                name: 'owners',
                type: 'MULTI-SELECT',
                title: 'مالک',
                options: this.owners.map((o) => ({ id: o.id, title: o.name })),
                view: 'SELECT',
                disableOn: () => this.owners?.length === 0,
            });

        this.ngxForm.inputs = [];
        while (inputs.length > 0) this.ngxForm.inputs.push(inputs.splice(0, 2));
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadExportDraftRq = {
            from: this.from,
            to: this.to,
            parties: this.parties === undefined ? (this.party ? [this.party] : []) : values['parties'],
            shipments: this.shipments === undefined ? (this.shipment ? [this.shipment] : []) : values['shipments'],
            transporters:
                this.transporters === undefined ? (this.transporter ? [this.transporter] : []) : values['transporters'],
            types: this.cargos === undefined ? [] : values['types'],
            cargos: this.cargos === undefined ? (this.cargo ? [this.cargo] : []) : values['cargos'],
            owners: this.owners === undefined ? (this.owner ? [this.owner] : []) : values['owners'],
            plate: this.plate,
            type: values['type'],
        };
        this.apiService.request<ILoadExportDraftRs>('LoadExportDraft', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
