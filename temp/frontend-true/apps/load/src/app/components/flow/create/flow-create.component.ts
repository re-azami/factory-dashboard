import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { ApiService, ILoadCargoDTO, ILoadDraftDTO, ILoadFlowPlateRs, ILoadTruckDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { FlowViewComponent } from '../view/flow-view.component';

import { FlowCreateBuyComponent } from './buy/flow-create-buy.component';
import { FlowCreateInComponent } from './in/flow-create-in.component';
import { FlowCreateOutComponent } from './out/flow-create-out.component';

interface IInfo {
    id: string;
    active: number;
    count: number;
    weight: number;
    remaining: number;
    approximate: boolean;
}

@Component({
    host: { selector: 'flow-create' },
    imports: [
        CommonModule,
        NgxFormModule,
        NgxHelperPlateModule,
        NgxHelperPipeModule,
        MaterialModule,
        PageModule,
        FlowCreateOutComponent,
        FlowCreateInComponent,
        FlowCreateBuyComponent,
    ],
    templateUrl: './flow-create.component.html',
    styleUrl: './flow-create.component.scss',
})
export class FlowCreateComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public ngxForm: INgxForm = {
        submit: 'بررسی ناوگان',
        inputs: [{ name: 'plate', type: 'PLATE', letter: 'ع', autoFocus: true }],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    public plate?: string;
    public truck?: ILoadTruckDTO;
    public draft?: ILoadDraftDTO;
    public cargos: ILoadCargoDTO[] = [];
    public info: { [key: string]: IInfo } = {};
    public cargoTruck: boolean = false;

    public createForm!: INgxForm;
    public cargo?: ILoadCargoDTO;

    public hasPersian = Helper.STRING.hasPersian;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { plate?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        if (this.data.plate && Helper.IS.plate(this.data.plate)) {
            this.ngxForm.inputs[0] = {
                name: 'plate',
                type: 'PLATE',
                value: this.data.plate.split('-') as [string, string, string, string],
                letter: 'ع',
                autoFocus: true,
            };
            this.setPlate(this.data.plate);
        }
    }

    ngxSubmit(values: INgxFormValues): void {
        const plate: string = values['plate'].join('-');
        this.setPlate(plate);
    }

    close(): void {
        this.ngxHelperBottomSheetService.close();
    }

    setPlate(plate: string): void {
        this.apiService.request<ILoadFlowPlateRs>('LoadFlowPlate', { params: { plate } }, (response) => {
            this.plate = response.plate;
            this.truck = response.truck;
            this.draft = response.draft;
            this.cargos = response.cargos.filter((cargo: ILoadCargoDTO) => {
                // اگر ناوگان ثبت نشده باشد و مدیریت ناوگان برای بار تعریف شده باشد، امکان ثبت حواله برای ناوگان وجود ندارد.
                if (!this.truck && cargo.truck === 'ON') return false;

                // اگر ناوگان ثبت شده باشد و مدیریت ناوگان برای بار تعریف نشده باشد، امکان ثبت حواله برای ناوگان وجود ندارد.
                if (this.truck && cargo.truck === 'OFF') return false;

                return true;
            });
            this.info = {};
            response.info.forEach((i) => (this.info[i.id] = i));
            this.cargoTruck = response.cargoTruck;

            // در صورتی که فقط یک بار در سیستم ثبت شده باشد، بخش انتخاب بار نمایش داده نمی‌شود.
            if (this.cargos.length === 1) this.setCargo(this.cargos[0]);
        });
    }

    resetPlate(): void {
        this.plate = undefined;
        this.truck = undefined;
        this.draft = undefined;
        this.cargos = [];
        this.cargo = undefined;
    }

    setCargo(cargo: ILoadCargoDTO): void {
        if (this.cargo) return;
        if (!this.cargos.find((c) => c.id === cargo.id)) return;

        this.cargo = cargo;
        this.createForm = {
            submit: `صدور ${LoadCargoInfo[cargo.type].draft}`,
            inputs: [
                {
                    type: 'COMMENT',
                    title: 'ناوگان',
                    value: this.truck ? this.truck.type : 'ثبت نشده',
                    button: { icon: 'edit', click: this.resetPlate.bind(this) },
                    description: this.truck
                        ? `راننده: ${this.truck.driver.name.first} ${this.truck.driver.name.last}` +
                          (this.truck.weight ? ` / توزین: ${Helper.NUMBER.format(this.truck.weight.weight)} کیلو` : '') +
                          (this.cargoTruck ? '\nناوگان به صورت اختصاصی برای بار تعریف شده است.' : '')
                        : undefined,
                },
                {
                    type: 'COMMENT',
                    title: 'بار',
                    value: cargo.title,
                    description: `نوع بار: ${LoadCargoInfo[cargo.type].title}`,
                    button: this.cargos.length > 1 ? { icon: 'edit', click: () => (this.cargo = undefined) } : undefined,
                },
            ],
            buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
        };
    }

    getApproximate(info: IInfo): number {
        const average: number = info.weight / info.count;
        const approximate: number = Math.ceil(info.remaining / average);
        return approximate < 0 ? 0 : approximate;
    }

    viewDraft(draft: ILoadDraftDTO): void {
        this.ngxHelperToastService.success('حواله مورد نظر با موفقیت ثبت شد.');
        this.ngxHelperBottomSheetService.close();

        const title: string = `مشخصات ${LoadCargoInfo[draft.cargo.type].draft}`;
        this.ngxHelperBottomSheetService.open(FlowViewComponent, title, { data: { draft } });
    }
}
