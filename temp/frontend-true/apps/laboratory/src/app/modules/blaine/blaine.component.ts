import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILaboratoryBlaineDeleteRs,
    ILaboratoryBlaineDTO,
    ILaboratoryBlaineListRs,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList, LoadCargoInfo } from '@lib/shared';

import { LaboratoryCargoService, LaboratoryTestService } from '../../providers';

import { BlaineCreateComponent } from './create/blaine-create.component';
import { BlaineUpdateComponent } from './update/blaine-update.component';

@Component({
    host: { selector: 'blaine' },
    templateUrl: './blaine.component.html',
    styleUrl: './blaine.component.scss',
    standalone: false
})
export class BlaineComponent {
    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'نتایج آزمایش بلین',
        description: 'ختکا :: محصول (CONCENTRATE)',
        toolbar: {
            route: ['/blaine'],
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
                action: (id: string) => this.create(id as 'DAY' | 'NIGHT'),
                menu: [
                    { id: 'DAY', title: 'شیفت روز', description: 'ساعت ۷ صبح تا ۷ شب' },
                    { id: 'NIGHT', title: 'شیفت شب', description: 'ساعت ۷  شب تا ۷ صبح' },
                ],
            },
        ],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public blaines: ILaboratoryBlaineDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryBlaineDTO> = {
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
            { title: 'نتیجه', value: 'result', type: 'NUMBER' },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
            'DIVIDER',
            { type: 'LOG', action: this.log.bind(this), access: { access: 'LABORATORY_LOG' } },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
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
        this.apiService.request<ILaboratoryBlaineListRs>(
            'LaboratoryBlaineList',
            { params: { line, cargo, page } },
            (response) => {
                this.loading = false;
                this.blaines = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(shift: 'DAY' | 'NIGHT'): void {
        this.ngxHelperBottomSheetService.open(
            BlaineCreateComponent,
            'ثبت نتیجه آزمایش بلین',
            { data: { shift, cargos: this.cargos } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ثبت شد.');
            },
        );
    }

    update(blaine: ILaboratoryBlaineDTO): void {
        this.ngxHelperBottomSheetService.open(
            BlaineUpdateComponent,
            'ویرایش نتیجه آزمایش بلین',
            { data: { cargos: this.cargos, blaine } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت ویرایش شد.');
            },
        );
    }

    delete(blaine: ILaboratoryBlaineDTO): void {
        const item: string = 'نتیجه آزمایش';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = blaine.id;
            this.apiService.request<ILaboratoryBlaineDeleteRs>('LaboratoryBlaineDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('نتیجه آزمایش با موفقیت حذف شد.');
            });
        });
    }

    log(blaine: ILaboratoryBlaineDTO): void {
        this.laboratoryTestService.showLog('LaboratoryBlaineLog', blaine.id);
    }
}
