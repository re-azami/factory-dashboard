import { Component } from '@angular/core';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadDraftDTO, ILoadDraftFinishedRs, IPaginationDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { SettingService } from '@lib/providers';
import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

@Component({
    host: { selector: 'draft-finished' },
    templateUrl: './draft-finished.component.html',
    styleUrl: './draft-finished.component.scss',
    standalone: false
})
export class DraftFinishedComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'حواله‌های قبلی',
        toolbar: {
            route: ['/draft', 'finished'],
            params: [
                {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع بار',
                    options: LoadCargoList.map((c: LoadCargo) => ({ id: c, title: LoadCargoInfo[c].title })),
                },
                { name: 'plate', type: 'PLATE', letter: 'ع' },
                { name: 'date', type: 'DATE', maxDate: new Date() },
            ],
        },
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public drafts: ILoadDraftDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadDraftDTO> = {
        type: 'حواله',
        columns: [
            { title: 'شماره حواله', value: 'code', english: true, action: (data) => ['/draft', 'info', data.id] },
            {
                title: 'تاریخ',
                value: (data) => (this.settingService.load.report === 'CREATE' ? data.date.create : data.date.finish),
                type: 'DATE',
                format: 'W، d N Y',
            },
            {
                title: 'ساعت',
                value: (data) => (this.settingService.load.report === 'CREATE' ? data.date.create : data.date.finish),
                type: 'DATE',
                format: 'H:I',
            },
            { value: 'plate', type: 'PLATE', isDescription: true },
            { title: 'بار', value: (data) => data.cargo.title, description: (data) => LoadCargoInfo[data.cargo.type].title },
            { title: 'طرف حساب', value: (data) => data.cargo.party?.title },
            { title: 'محموله', value: (data) => data.cargo.shipment?.title },
            { title: 'باربری', value: (data) => data.transporter?.title },
            { title: 'وزن خالص', value: (data) => data.weight.net, type: 'NUMBER' },
        ],
    };

    constructor(private readonly apiService: ApiService, private readonly settingService: SettingService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const type: string = this.params?.params?.['type']?.param || '';
        const plate: string = this.params?.params?.['plate']?.param || '';
        const date: string = (this.params?.params?.['date']?.value as Date)?.toJSON() || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadDraftFinishedRs>(
            'LoadDraftFinished',
            { params: { type, plate, date, page } },
            (response) => {
                this.loading = false;
                this.drafts = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
