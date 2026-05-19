import { ILoadDraftDTO, ILoadTruckDTO } from '../../../dtos';

export interface ILoadFlowWeightPlateRq {
    readonly plate: string;
}

export interface ILoadFlowWeightPlateRs {
    readonly truck: ILoadTruckDTO;
    readonly draft: ILoadDraftDTO;
}
