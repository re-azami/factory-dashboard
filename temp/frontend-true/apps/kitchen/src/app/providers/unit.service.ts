import { Injectable } from '@angular/core';

import { Helper, UnitLength, UnitVolume, UnitWeight } from '@webilix/helper-library';
import { NgxFormInputs } from '@webilix/ngx-form';

import { KitchenUnit } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class KitchenUnitService {
    formInput(
        unit: KitchenUnit,
        name: string,
        options?: { title?: string; value?: { unit: string; value: number }; descriotion?: string; optional?: boolean },
    ): NgxFormInputs {
        switch (unit) {
            case 'WEIGHT':
                const wValue =
                    options?.value &&
                    options.value.value > 0 &&
                    Helper.UNIT.WEIGHT.list.includes(options.value.unit as UnitWeight)
                        ? { unit: options.value.unit as UnitWeight, value: options.value.value }
                        : undefined;

                return {
                    name,
                    type: 'UNIT-WEIGHT',
                    title: options?.title,
                    value: wValue,
                    optional: options?.optional,
                    minimum: 0.001,
                    decimal: 3,
                    description: options?.descriotion,
                    autoFocus: true,
                };
            case 'VOLUME':
                const vValue =
                    options?.value &&
                    options.value.value > 0 &&
                    Helper.UNIT.VOLUME.list.includes(options.value.unit as UnitVolume)
                        ? { unit: options.value.unit as UnitVolume, value: options.value.value }
                        : undefined;

                return {
                    name,
                    type: 'UNIT-VOLUME',
                    title: options?.title,
                    value: vValue,
                    optional: options?.optional,
                    minimum: 0.001,
                    decimal: 3,
                    description: options?.descriotion,
                    autoFocus: true,
                };
            case 'LENGTH':
                const lValue =
                    options?.value &&
                    options.value.value > 0 &&
                    Helper.UNIT.LENGTH.list.includes(options.value.unit as UnitLength)
                        ? { unit: options.value.unit as UnitLength, value: options.value.value }
                        : undefined;

                return {
                    name,
                    type: 'UNIT-LENGTH',
                    title: options?.title,
                    value: lValue,
                    optional: options?.optional,
                    minimum: 0.001,
                    decimal: 3,
                    description: options?.descriotion,
                    autoFocus: true,
                };
            case 'COUNT':
                return {
                    name,
                    type: 'NUMBER',
                    title: options?.title || 'تعداد',
                    value: options?.value?.value,
                    optional: options?.optional,
                    minimum: 1,
                    suffix: 'عدد',
                    description: options?.descriotion,
                    autoFocus: true,
                };
        }
    }

    formValue(unit: KitchenUnit, value: any): { unit: string; value: number } | null {
        let formValue: { unit: string; value: number } | null = null;
        switch (unit) {
            case 'WEIGHT':
                const weight: { unit: UnitWeight; value: number } = value;
                if (!!weight && weight.value > 0) formValue = weight;
                break;
            case 'VOLUME':
                const volume: { unit: UnitVolume; value: number } = value;
                if (!!volume && volume.value > 0) formValue = volume;
                break;
            case 'LENGTH':
                const length: { unit: UnitLength; value: number } = value;
                if (!!length && length.value > 0) formValue = length;
                break;
            case 'COUNT':
                const count: number = value;
                if (!!count && count > 0) formValue = { unit: 'COUNT', value: count };
                break;
        }

        return formValue;
    }

    valueAmount(unit: KitchenUnit, value: { unit: string; value: number }): number {
        switch (unit) {
            case 'WEIGHT':
                const wUnit: UnitWeight = value.unit as UnitWeight;
                return Helper.UNIT.WEIGHT.list.includes(wUnit) ? Helper.UNIT.WEIGHT.convert(value.value, wUnit, 'GR') : 0;
            case 'VOLUME':
                const vUnit: UnitVolume = value.unit as UnitVolume;
                return Helper.UNIT.VOLUME.list.includes(vUnit) ? Helper.UNIT.VOLUME.convert(value.value, vUnit, 'ML') : 0;
            case 'LENGTH':
                const lUnit: UnitLength = value.unit as UnitLength;
                return Helper.UNIT.LENGTH.list.includes(lUnit) ? Helper.UNIT.LENGTH.convert(value.value, lUnit, 'MM') : 0;
            case 'COUNT':
                return value.value;
        }
    }

    valueTitle(unit: KitchenUnit, value: number | { unit: string; value: number }): string {
        if (typeof value === 'object')
            switch (unit) {
                case 'WEIGHT':
                    const wUnit: UnitWeight = value.unit as UnitWeight;
                    value = Helper.UNIT.WEIGHT.list.includes(wUnit)
                        ? Helper.UNIT.WEIGHT.convert(value.value, wUnit, 'GR')
                        : 0;
                    break;
                case 'VOLUME':
                    const vUnit: UnitVolume = value.unit as UnitVolume;
                    value = Helper.UNIT.VOLUME.list.includes(vUnit)
                        ? Helper.UNIT.VOLUME.convert(value.value, vUnit, 'ML')
                        : 0;
                    break;
                case 'LENGTH':
                    const lUnit: UnitLength = value.unit as UnitLength;
                    value = Helper.UNIT.LENGTH.list.includes(lUnit)
                        ? Helper.UNIT.LENGTH.convert(value.value, lUnit, 'MM')
                        : 0;
                    break;
                case 'COUNT':
                    value = value.value;
                    break;
            }

        if (value === 0) return 'ناموجود';

        const convert = (value: number, rates: { rate: number; unit: string }[]): string => {
            let r: number = 0;
            while (r < rates.length && value >= rates[r].rate) value /= rates[r++].rate;
            return `${Helper.NUMBER.format(+value.toFixed(2))} ${rates[r].unit}`;
        };

        const isNegative = value < 0;
        let pipeValue: string = '';

        switch (unit) {
            case 'WEIGHT':
                pipeValue = convert(Math.abs(value), [
                    { rate: 1000, unit: 'گرم' },
                    { rate: 1000, unit: 'کیلوگرم' },
                    { rate: Infinity, unit: 'تن' },
                ]);
                break;

            case 'VOLUME':
                pipeValue = convert(Math.abs(value), [
                    { rate: 1000, unit: 'میلی‌لیتر' },
                    { rate: Infinity, unit: 'لیتر' },
                ]);
                break;

            case 'LENGTH':
                pipeValue = convert(Math.abs(value), [
                    { rate: 10, unit: 'میلی‌متر' },
                    { rate: 100, unit: 'سانتی‌متر' },
                    { rate: 1000, unit: 'متر' },
                    { rate: Infinity, unit: 'کیلومتر' },
                ]);
                break;

            case 'COUNT':
                pipeValue = Helper.NUMBER.format(Math.abs(value)) + ' عدد';
                break;
        }

        return `${pipeValue}${isNegative ? ' (منفی)' : ''}`;
    }

    valueColor(value: number): string {
        return value === 0 ? 'var(--accentColor)' : value < 0 ? 'var(--warnColor)' : '';
    }
}
