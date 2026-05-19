import { IKitchenInventoryDTO, IPaginationDTO } from '../../../dtos';

export interface IKitchenGoodInventoryRs {
    readonly list: IKitchenInventoryDTO[];
    readonly pagination: IPaginationDTO;
}
