import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import {
    ApiService,
    ILoadDraftDTO,
    ILoadFlowWeightPlateRq,
    ILoadFlowWeightPlateRs,
    ILoadFlowWeightRq,
    ILoadFlowWeightRs,
    ILoadTruckDTO,
} from '@lib/apis';

import { LoadFlowService, LoadSettingService } from '../../../providers';

@Component({
    host: { selector: 'flow-weight' },
    imports: [CommonModule, NgxFormModule, NgxHelperPlateModule],
    templateUrl: './flow-weight.component.html',
    styleUrl: './flow-weight.component.scss'
})
export class FlowWeightComponent implements OnInit {
    public action: 'PLATE' | 'WEIGHT' = 'PLATE';
    public truck!: ILoadTruckDTO;
    public draft?: ILoadDraftDTO;

    public ngxPlateForm!: INgxForm;
    public ngxWeightForm!: INgxForm;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadFlowService: LoadFlowService,
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
                    submit: 'توزین ناوگان',
                    inputs: [
                        {
                            name: 'weight',
                            type: 'NUMBER',
                            title: 'وزن خالی',
                            value: this.truck.weight?.weight,
                            suffix: 'کیلو',
                            minimum: 10_000,
                            maximum: this.loadSettingService.weight.empty,
                            multiplyOf: this.loadSettingService.weight.multiply,
                            autoFocus: true,
                        },
                        {
                            name: 'update',
                            type: 'CHECKBOX',
                            message: 'به‌روزرسانی وزن خالی حواله فعال',
                            description:
                                'در صورت انتخاب این گزینه، پس از ثبت اطلاعات توزین ناوگان، ' +
                                'اطلاعات وزنی حواله نمایش داده شده به صورت اتوماتیک به‌روزرسانی می‌شود.',
                            hideOn: () => !this.draft,
                        },
                    ],
                    buttons: [
                        { title: 'تغییر ناوگان', action: () => this.setAction('PLATE') },
                        { title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() },
                    ],
                };
                break;
        }
    }

    getPlate(values: INgxFormValues): void {
        const body: ILoadFlowWeightPlateRq = {
            plate: values['plate'].join('-'),
        };
        this.apiService.request<ILoadFlowWeightPlateRs>('LoadFlowWeightPlate', { body }, (response) => {
            this.truck = response.truck;
            this.draft = response.draft || undefined;

            this.setAction('WEIGHT');
        });
    }

    setWeight(values: INgxFormValues): void {
        const body: ILoadFlowWeightRq = {
            plate: this.truck.plate,
            weight: values['weight'],
            update: !!values['update'],
        };
        this.apiService.request<ILoadFlowWeightRs>('LoadFlowWeight', { body }, (response) => {
            this.loadFlowService.setTruckWeighted(response);

            this.ngxHelperToastService.success('توزین ناوگان با موفقیت ثبت شد.');
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
