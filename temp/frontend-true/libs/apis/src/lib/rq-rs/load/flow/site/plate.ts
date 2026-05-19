import { ILoadCargoDTO, ILoadTruckDTO } from '../../../../dtos';

export interface ILoadFlowSitePlateRs {
    readonly plate: string;
    readonly truck: ILoadTruckDTO;
    readonly cargos: ILoadCargoDTO[];
    readonly cargoTruck: boolean;
}
