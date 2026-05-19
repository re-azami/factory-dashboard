import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { LaboratoryCargoService, LaboratoryTestService } from 'apps/laboratory/src/app/providers';

import {
    ApiService,
    ILaboratoryDavisDeleteRs,
    ILaboratoryDavisDTO,
    ILaboratoryDavisListRs,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList, LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'davis' },
    templateUrl: './davis.component.html',
    styleUrl: './davis.component.scss',
    standalone: false
})
export class DavisComponent {
    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'نتایج آزمایش دیویس تیوب',
        description: 'ختکا :: خوراک (FEED)',
        toolbar: {
            route: ['/davis'],
            params: [
                {
                    name: 'line',
                    type: 'SELECT',
                    title: 'خط',
                    options: LaboratoryLineList.map((line: LaboratoryLine) => ({
                        id: line,
                        title: LaboratoryLineInfo[line].title,
                    })),
                },
                { name: 'cargo', type: 'SELECT', title: 'بار', options: this.cargos },
            ],
        },
        actions: [
            {
                type: 'MENU',
                title: 'ثبت نتیجه',
                icon: 'add',
                color: 'primary',
                action: (id: string) => ['/davis', 'create', id],
                menu: [
                    { id: 'DAY', title: 'شیفت روز', description: 'ساعت ۷ صبح تا ۷ شب' },
                    { id: 'NIGHT', title: 'شیفت شب', description: 'ساعت ۷  شب تا ۷ صبح' },
                ],
            },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public davises: ILaboratoryDavisDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryDavisDTO> = {
        type: 'نتیجه آزمایش',
        columns: [
            { title: 'تاریخ', value: (data) => data.time.begin, type: 'DATE' },
            { title: 'خط', value: (data) => LaboratoryLineInfo[data.line].title, isDescription: true },
            { title: 'شروع', value: (data) => data.time.begin, type: 'DATE', format: 'H:I' },
            {
                title: 'پایان',
                value: (data) => data.time.end,
                type: 'DATE',
                format: 'H:I',
                description: (data) => this.laboratoryTestService.getTimeDescription(data.time.begin, data.time.end),
            },
            {
                title: 'بار',
                value: (data) => data.cargo?.title,
                description: (data) => (data.cargo?.type ? LoadCargoInfo[data.cargo.type].title : undefined),
                english: (data) => !!data.cargo && data.cargo.portions.length > 0,
                action: (data) =>
                    !!data.cargo && data.cargo.portions.length > 0
                        ? () => this.laboratoryCargoService.showMixed(data.cargo?.title || '', data.cargo?.portions || [])
                        : [],
            },
            { title: 'طرف حساب', value: (data) => data.cargo?.party?.title },
            { title: 'محموله', value: (data) => data.cargo?.shipment?.title },
            { title: 'ریکاوری', value: (data) => data.recovery?.result, type: 'NUMBER' },
            { title: 'FE محصول', value: (data) => data.product.fe?.result, type: 'NUMBER' },
            { title: 'FEO محصول', value: (data) => data.product.feo?.result, type: 'NUMBER' },
            { title: 'FE باطله', value: (data) => data.tail.fe?.result, type: 'NUMBER' },
            { title: 'FEO باطله', value: (data) => data.tail.feo?.result, type: 'NUMBER' },
        ],
        actions: [
            { type: 'UPDATE', action: (data) => ['/davis', 'update', data.id] },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LABORATORY_LOG' } },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly laboratoryCargoService: LaboratoryCargoService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const line: string = this.params?.params?.['line']?.param || '';
        const cargo: string = this.params?.params?.['cargo']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryDavisListRs>(
            'LaboratoryDavisList',
            { params: { line, cargo, page } },
            (response) => {
                this.loading = false;
                this.davises = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    delete(davis: ILaboratoryDavisDTO): void {
        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = davis.id;
            this.apiService.request<ILaboratoryDavisDeleteRs>('LaboratoryDavisDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }

    log(davis: ILaboratoryDavisDTO): void {
        this.laboratoryTestService.showLog('LaboratoryDavisLog', davis.id);
    }
}
