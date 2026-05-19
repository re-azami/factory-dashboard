import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadFlowSitePlateRs,
    ILoadFlowSiteWeightRq,
    ILoadFlowSiteWeightRs,
    ILoadTruckDTO,
} from '@lib/apis';

import { LoadSettingService } from '../../../providers';

@Component({
    host: { selector: 'flow-site' },
    imports: [CommonModule, NgxFormModule, NgxHelperPlateModule],
    templateUrl: './flow-site.component.html',
    styleUrl: './flow-site.component.scss'
})
export class FlowSiteComponent implements OnInit {
    public action: 'PLATE' | 'WEIGHT' = 'PLATE';
    public emptyChanged: boolean = false;

    public truck!: ILoadTruckDTO;
    public cargos: ILoadCargoDTO[] = [];
    public cargoTruck: boolean = false;

    public ngxPlateForm!: INgxForm;
    public ngxWeightForm!: INgxForm;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        this.setAction('PLATE');
    }

    setAction(action: 'PLATE' | 'WEIGHT') {
        this.action = action;

        switch (this.action) {
            case 'PLATE':
                this.ngxPlateForm = {
                    submit: 'بررسی ناوگان',
                    inputs: [{ name: 'plate', type: 'PLATE', letter: 'ع', autoFocus: true }],
                    buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
                };
                break;

            case 'WEIGHT':
                this.ngxWeightForm = {
                    submit: 'توزین بار داخلی',
                    inputs: [
                        {
                            name: 'cargo',
                            type: 'SELECT',
                            title: 'بار داخلی',
                            options: this.cargos.map((c) => ({ id: c.id, title: c.title })),
                            description: this.cargoTruck ? 'ناوگان به صورت اختصاصی برای بار تعریف شده است.' : undefined,
                        },
                        [
                            {
                                name: 'empty',
                                type: 'NUMBER',
                                title: 'وزن خالی',
                                value: this.truck.weight?.weight,
                                suffix: 'کیلو',
                                minimum: 10_000,
                                maximum: this.loadSettingService.weight.empty,
                                multiplyOf: this.loadSettingService.weight.multiply,
                            },
                            {
                                name: 'full',
                                type: 'NUMBER',
                                title: 'وزن پر',
                                suffix: 'کیلو',
                                minimum: this.loadSettingService.weight.full,
                                maximum: 99_999,
                                multiplyOf: this.loadSettingService.weight.multiply,
                                autoFocus: true,
                            },
                        ],
                        {
                            type: 'COMMENT',
                            title: 'وزن خالص',
                            value: '',
                            onChange: this.getWeight.bind(this),
                            english: true,
                        },
                        { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                    ],
                    buttons: [
                        { title: 'تغییر ناوگان', action: () => this.setAction('PLATE') },
                        { title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() },
                    ],
                };
                break;
        }
    }

    getWeight(values: INgxFormValues): string | null {
        this.emptyChanged = values['empty'] !== this.truck.weight?.weight;

        if (isNaN(values['empty']) || values['empty'] < 10_000 || values['empty'] > this.loadSettingService.weight.empty)
            return null;
        if (isNaN(values['full']) || values['full'] < this.loadSettingService.weight.full || values['full'] > 99_999)
            return null;
        if (values['full'] <= values['empty']) return null;

        return Helper.NUMBER.format(values['full'] - values['empty'], 'EN');
    }

    getPlate(values: INgxFormValues): void {
        const plate: string = values['plate'].join('-');
        this.apiService.request<ILoadFlowSitePlateRs>('LoadFlowSitePlate', { params: { plate } }, (response) => {
            this.truck = response.truck;
            this.cargos = response.cargos;
            this.cargoTruck = response.cargoTruck;

            this.setAction('WEIGHT');
        });
    }

    setWeight(values: INgxFormValues): void {
        const body: ILoadFlowSiteWeightRq = {
            truck: this.truck.id,
            cargo: values['cargo'],
            empty: values['empty'],
            full: values['full'],
            description: values['description'],
        };
        this.apiService.request<ILoadFlowSiteWeightRs>('LoadFlowSiteWeight', { body }, () => {
            this.ngxHelperToastService.success('توزین بار داخلی با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close();
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        switch (this.action) {
            case 'PLATE':
                this.getPlate(values);
                break;

            case 'WEIGHT':
                this.setWeight(values);
                break;
        }
    }
}
