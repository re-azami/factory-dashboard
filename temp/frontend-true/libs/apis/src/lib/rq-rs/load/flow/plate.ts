import { ILoadCargoDTO, ILoadDraftDTO, ILoadTruckDTO } from '../../../dtos';

export interface ILoadFlowPlateRs {
    readonly plate: string;
    readonly truck: ILoadTruckDTO;
    readonly draft: ILoadDraftDTO;
    readonly cargos: ILoadCargoDTO[];
    readonly info: {
        readonly id: string;
        readonly active: number;
        readonly count: number;
        readonly weight: number;
        readonly remaining: number;
        readonly approximate: boolean;
    }[];
    readonly cargoTruck: boolean;
}
