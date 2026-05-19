import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Helper } from '@webilix/helper-library';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILaboratoryLoadDataRs, ILaboratoryLoadDTO, ILaboratoryLoadListRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LaboratoryResultInfo, LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'load' },
    templateUrl: './load.component.html',
    styleUrl: './load.component.scss',
    standalone: false
})
export class LoadComponent {
    public data: ILaboratoryLoadDataRs = this.activatedRoute.snapshot.data['data'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای روزانه',
        toolbar: {
            route: ['/load'],
            params: [
                { name: 'party', type: 'SELECT', title: 'طرف حساب', options: this.data.party },
                { name: 'shipment', type: 'SELECT', title: 'محموله', options: this.data.shipment },
                { name: 'date', type: 'DATE', maxDate: new Date() },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public loads: ILaboratoryLoadDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryLoadDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            { title: 'تاریخ', value: 'date', type: 'DATE', action: (data) => ['/load', 'update', data.id] },
            {
                title: 'بار',
                value: (data) => data.cargo.title,
                isDescription: true,
                description: (data) => LoadCargoInfo[data.cargo.type].title,
            },
            { title: 'طرف حساب', value: (data) => data.cargo.party?.title },
            { title: 'محموله', value: (data) => data.cargo.shipment?.title },
            {
                title: 'وزن',
                value: (data) => data.draft.weight,
                type: 'NUMBER',
                description: (data) => Helper.NUMBER.format(data.draft.count) + ' حواله',
            },
            { title: LaboratoryResultInfo['FE'].title, value: (data) => data.fe?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['FEO'].title, value: (data) => data.feo?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['GRIND'].title, value: (data) => data.grind?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['MOISTURE'].title, value: (data) => data.moisture?.result, type: 'NUMBER' },
            { title: LaboratoryResultInfo['SULPHUR'].title, value: (data) => data.sulphur?.result, type: 'NUMBER' },
        ],
    };

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const party: string = this.params?.params?.['party']?.param || '';
        const shipment: string = this.params?.params?.['shipment']?.param || '';
        const date: string = (this.params?.params?.['date']?.value as Date)?.toJSON() || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryLoadListRs>(
            'LaboratoryLoadList',
            { params: { party, shipment, date, page } },
            (response) => {
                this.loading = false;
                this.loads = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
