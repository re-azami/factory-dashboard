import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';

import { INgxForm, INgxFormValues, NgxFormInputs, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ILaboratoryTestGrindDTO } from '@lib/apis';
import { DeviceService, IDeviceSize } from '@lib/providers';
import { LaboratoryResultInfo } from '@lib/shared';

import { LaboratoryTestService } from '../../../providers';

@Component({
    host: { selector: 'test-grind' },
    imports: [CommonModule, NgxFormModule],
    templateUrl: './test-grind.component.html',
    styleUrl: './test-grind.component.scss'
})
export class TestGrindComponent implements OnInit, OnDestroy {
    public laboratoryResultInfo = LaboratoryResultInfo;

    public sizes: number[] = this.data.sizes;
    public total?: number = this.data.total;

    public totalRG?: number;
    public RP: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
    public totalRP?: number;
    public CP: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
    public final: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
    public result?: number;
    public error?: string;

    public ngxForm: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs:
            this.data.sizes.length === 0
                ? [
                      {
                          name: 'result',
                          type: 'NUMBER',
                          title: LaboratoryResultInfo['GRIND'].title,
                          value: this.data.grind?.result || undefined,
                          minimum: 0,
                          maximum: 10000,
                          suffix: 'میکرون',
                          autoFocus: true,
                      },
                  ]
                : [
                      [
                          ...this.data.sizes.map(
                              (size: number, index: number) =>
                                  ({
                                      name: `value_${size}`,
                                      type: 'NUMBER',
                                      title: 'R(g)',
                                      value: this.data.grind?.sizes?.find((g) => g.size === size)?.value || undefined,
                                      hideIcon: true,
                                      decimal: 4,
                                      autoFocus: index === 0,
                                      id: `ID-input-${index}`,
                                      keyboard: {
                                          up: (event: KeyboardEvent): void =>
                                              this.laboratoryTestService.inputJump(index, event, true),
                                      },
                                  } as NgxFormInputs),
                          ),
                          ...(this.data.total
                              ? [
                                    { type: 'COMMENT', title: '', value: '', english: true } as NgxFormInputs,
                                    { type: 'COMMENT', title: '', value: '', english: true } as NgxFormInputs,
                                    { type: 'COMMENT', title: '', value: '', english: true } as NgxFormInputs,
                                ]
                              : []),
                      ],
                  ],
        buttons: [
            {
                title: this.data.grind && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
        floatLabel: 'always',
    };

    public ngxFormMobile: INgxForm = {
        submit: 'محاسبه نتیجه',
        inputs: [
            ...this.data.sizes.map((size: number, index: number) => ({
                inputs: [
                    {
                        name: `value_${size}`,
                        type: 'NUMBER',
                        title: '',
                        value: this.data.grind?.sizes?.find((g) => g.size === size)?.value || undefined,
                        hideIcon: true,
                        decimal: 4,
                        autoFocus: index === 0,
                        id: `ID-input-${index}`,
                        keyboard: {
                            up: (event: KeyboardEvent): void => this.laboratoryTestService.inputJump(index, event, true),
                        },
                    },
                    {
                        type: 'COMMENT',
                        title: '',
                        value: `${size} R(g)`,
                        english: true,
                    },
                ] as NgxFormInputs[],
                flex: [2, 1],
            })),
        ],
        buttons: [
            {
                title: this.data.grind && !this.data.test ? 'حذف مقدار' : 'انصراف',
                action: () => this.ngxHelperBottomSheetService.close({}),
            },
        ],
        floatLabel: 'always',
    };

    public isMobile: boolean = this.deviceService.size.isMobile;
    private onSizeChanged?: Subscription;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private data: { sizes: number[]; total?: number; grind?: ILaboratoryTestGrindDTO; test?: string },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly deviceService: DeviceService,
        private readonly laboratoryTestService: LaboratoryTestService,
    ) {}

    ngOnInit(): void {
        if (this.data.sizes.length === 0 && this.data.test)
            this.ngxForm.inputs.unshift({ type: 'COMMENT', title: 'آزمایش', value: this.data.test });

        if (this.data.sizes.length !== 0) {
            const size: number = (this.data.sizes.length + 1 + (this.data.total ? 3 : 0)) * 70;
            document.documentElement.style.setProperty('--ngxHelperDialogWidth', `${size}px`);
        }

        const values: { [key: string]: any } = {};
        this.data.sizes.forEach(
            (size: number) => (values[`value_${size}`] = this.data.grind?.sizes.find((g) => g.size === size)?.value || null),
        );
        this.ngxChange(values);

        this.onSizeChanged = this.deviceService.onSizeChanged.subscribe({
            next: (size: IDeviceSize) => (this.isMobile = size.isMobile),
        });
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
        this.onSizeChanged?.unsubscribe();
    }

    calculateGrind(values: { [key: string]: number }): {
        totalRG: number | undefined;
        RP: (number | null)[];
        totalRP: number | undefined;
        CP: (number | null)[];
        final: (number | null)[];
        result: number | undefined;
        error: string | undefined;
        total: { value?: number; remaining?: number; difference?: number };
    } {
        let totalRG: number | undefined = undefined;
        let RP: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
        let totalRP: number | undefined = undefined;
        let CP: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
        let final: (number | null)[] = [...Array(this.data.sizes.length)].map((_) => null);
        let result: number | undefined = undefined;
        let error: string | undefined = undefined;
        // TOTAL
        let value: number | undefined = undefined;
        let remaining: number | undefined = undefined;
        let difference: number | undefined = undefined;

        const RG: number[] = this.data.sizes.map((size: number) => +values[`value_${size}`]);
        let canCalculate: boolean = true;
        for (let r = 0; r < RG.length; r++) if (isNaN(RG[r]) || RG[r] === 0) canCalculate = false;

        if (canCalculate) {
            if (this.data.total) {
                value = +RG.reduce((sum: number, rg) => sum + (rg || 0), 0).toFixed(2);
                difference = this.data.total - value;
                remaining = RG[RG.length - 1] + difference;
                RG[RG.length - 1] = remaining;
            }

            totalRG = RG.reduce((sum: number, rg) => sum + (rg || 0), 0);
            RP = RG.map((rg: number) => (rg / totalRG!) * 100);
            totalRP = RP.reduce((sum: number, rp) => sum + (rp || 0), 0);
            CP = RP.map((_, i) => 100 - RP.slice(0, i + 1).reduce((sum: number, rp) => sum + (rp || 0), 0));

            let finalFound: boolean = false;
            final = CP.map((cp: number | null, i: number) => {
                if (finalFound || cp === null) return null;

                const nextCP: number = CP[i + 1] || 0;
                const size: number = this.data.sizes[i];
                const nextSize: number = this.data.sizes[i + 1] || 0;

                if (cp >= 80 && nextCP < 80 && cp - nextCP > 0 && 100 - cp > 0 && nextCP > 0 && !finalFound) {
                    finalFound = true;
                    return ((80 - nextCP) * (size - nextSize)) / (cp - nextCP) + nextSize;
                }

                if (i === 0 && cp < 80 && cp > 0) {
                    finalFound = true;
                    return (size * 80) / cp;
                }

                if (!finalFound && cp === 80) {
                    finalFound = true;
                    return size;
                }

                return null;
            });

            const totalFinal: number = final.reduce((sum: number, f) => sum + (f || 0), 0);
            if (totalRG > 0 && totalFinal < 3000 && totalFinal > 36) result = totalFinal;
            else if (totalFinal > 10000) error = '> 10,000';
            else if (totalFinal > 0 && totalFinal < 36) error = '< 36';
            else if (totalFinal === 0 && totalRG > 0) error = 'الكهای بالاتر يا پايين تر را استفاده كنيد';
            else if (totalFinal === 0 && totalRG === 0) error = undefined;
            else result = totalFinal;

            result = result ? Math.round(result) : undefined;
        }

        return { totalRG, RP, totalRP, CP, final, result, error, total: { value, remaining, difference } };
    }

    setValue(index: number, value: string): void {
        const row = this.ngxForm.inputs[0];
        if (!Array.isArray(row)) return;

        const input = row[this.data.sizes.length + index];
        if (!input || !('type' in input) || input.type !== 'COMMENT') return;

        input.value = value;
    }

    ngxChange(values: INgxFormValues): void {
        const data = this.calculateGrind(values);
        this.totalRG = data.totalRG;
        this.RP = data.RP;
        this.totalRP = data.totalRP;
        this.CP = data.CP;
        this.final = data.final;
        this.result = data.result;
        this.error = data.error;

        this.setValue(0, data.total.value !== undefined ? (+data.total.value.toFixed(2)).toString() : '');
        this.setValue(1, data.total.remaining !== undefined ? (+data.total.remaining.toFixed(2)).toString() : '');
        this.setValue(2, data.total.difference !== undefined ? (+data.total.difference.toFixed(2)).toString() : '');
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.sizes.length === 0) {
            const grind: ILaboratoryTestGrindDTO = { sizes: [], result: values['result'] };
            this.ngxHelperBottomSheetService.close({ grind });
            return;
        }

        if (!this.result) return;

        const grind: ILaboratoryTestGrindDTO = {
            sizes: this.data.sizes.map((size: number) => ({ size, value: values[`value_${size}`] })),
            result: this.result,
        };
        this.ngxHelperBottomSheetService.close({ grind });
    }
}
