import { ILaboratoryTestDavisRecoveryDTO } from './davis';
import {
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from './test';

export interface ILaboratoryMiscDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly description: string;
    readonly fe: ILaboratoryTestFeDTO;
    readonly feo: ILaboratoryTestFeODTO;
    readonly grind: ILaboratoryTestGrindDTO;
    readonly moisture: ILaboratoryTestMoistureDTO;
    readonly sulphur: ILaboratoryTestSulphurDTO;
    readonly gauss: number;
    readonly recovery: ILaboratoryTestDavisRecoveryDTO;
    readonly product: {
        readonly fe: ILaboratoryTestFeDTO;
        readonly feo: ILaboratoryTestFeODTO;
    };
    readonly tail: {
        readonly fe: ILaboratoryTestFeDTO;
        readonly feo: ILaboratoryTestFeODTO;
    };
}
