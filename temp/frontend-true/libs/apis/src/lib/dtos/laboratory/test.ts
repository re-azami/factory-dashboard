import { LaboratoryAction } from '@lib/shared';

export interface ILaboratoryTestFeDTO {
    readonly weight: number | null;
    readonly volume: number | null;
    readonly standard: number | null;
    readonly result: number;
}

export interface ILaboratoryTestFeODTO {
    readonly weight: number | null;
    readonly volume: number | null;
    readonly standard: number | null;
    readonly result: number;
}

export interface ILaboratoryTestGrindDTO {
    readonly sizes: { readonly size: number; readonly value: number }[];
    readonly result: number;
}

export interface ILaboratoryTestMoistureDTO {
    readonly empty: number | null;
    readonly initial: number | null;
    readonly final: number | null;
    readonly result: number;
}

export interface ILaboratoryTestSulphurDTO {
    readonly result: number;
}

export interface ILaboratoryTestLogDTO {
    readonly action: LaboratoryAction;
    readonly date: Date;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
    readonly description: string;
}
