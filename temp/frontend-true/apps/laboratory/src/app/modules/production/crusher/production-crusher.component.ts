import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILaboratoryCrusherDeleteRs,
    ILaboratoryCrusherDTO,
    ILaboratoryCrusherListRs,
    IOptionDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { LaboratoryLine, LaboratoryLineInfo, LaboratoryLineList, LoadCargoInfo } from '@lib/shared';

import { LaboratoryCargoService, LaboratoryTestService } from '../../../providers';

import { ProductionCrusherCreateComponent } from './create/production-crusher-create.component';
import { ProductionCrusherUpdateComponent } from './update/production-crusher-update.component';

@Component({
    host: { selector: 'production-crusher' },
    standalone: false,
    templateUrl: './production-crusher.component.html',
    styleUrl: './production-crusher.component.scss',
})
export class ProductionCrusherComponent {
    public cargos: IOptionDTO[] = this.activatedRoute.snapshot.data['cargos'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'تولید سنگ شکن',
        toolbar: {
            route: ['/production', 'crusher'],
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
                { name: 'date', type: 'DATE', maxDate: new Date() },
            ],
        },
        actions: [
            {
                type: 'MENU',
                title: 'ثبت تولید ',
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
    public crushers: ILaboratoryCrusherDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratoryCrusherDTO> = {
        type: 'اطلاعات تولید',
        columns: [
            {
                title: 'تاریخ',
                value: (data) => data.time.begin,
                type: 'DATE',
                action: (data) => ['/production', 'crusher', data.id],
            },
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
            { title: 'تناژ خوراک', value: (data) => data.tonnage.feed, type: 'NUMBER' },
            { title: 'تناژ تولید', value: (data) => data.tonnage.product, type: 'NUMBER' },
            { title: 'گاوس ۱۲۰۰', value: (data) => data.tonnage.gauss1200, type: 'NUMBER' },
            { title: 'گاوس ۲۰۰۰', value: (data) => data.tonnage.gauss2000, type: 'NUMBER' },
            { title: 'تناژ باطله', value: (data) => data.tonnage.tail, type: 'NUMBER' },
            { title: 'تعداد نتایج', value: 'count', type: 'NUMBER' },
        ],
        actions: [
            {
                title: 'مشاهده نتایج',
                icon: 'biotech',
                action: (data: ILaboratoryCrusherDTO) => ['/production', 'crusher', data.id],
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this), hideOn: (data) => data.count !== 0 },
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
        const date: string = (this.params?.params?.['date']?.value as Date)?.toJSON() || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratoryCrusherListRs>(
            'LaboratoryCrusherList',
            { params: { line, cargo, date, page } },
            (response) => {
                this.loading = false;
                this.crushers = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(shift: 'DAY' | 'NIGHT'): void {
        this.ngxHelperBottomSheetService.open(
            ProductionCrusherCreateComponent,
            'ثبت تولید سنگ شکن',
            { data: { shift, cargos: this.cargos } },
            () => this.loadList(),
        );
    }

    update(crusher: ILaboratoryCrusherDTO): void {
        this.ngxHelperBottomSheetService.open(
            ProductionCrusherUpdateComponent,
            'ویرایش تولید سنگ شکن',
            { data: { cargos: this.cargos, crusher } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت ویرایش شد.');
            },
        );
    }

    delete(crusher: ILaboratoryCrusherDTO): void {
        const item: string = 'اطلاعات تولید';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = crusher.id;
            this.apiService.request<ILaboratoryCrusherDeleteRs>('LaboratoryCrusherDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('اطلاعات تولید با موفقیت حذف شد.');
            });
        });
    }

    log(crusher: ILaboratoryCrusherDTO): void {
        this.laboratoryTestService.showLog('LaboratoryCrusherLog', crusher.id);
    }
}
