import { IKitchenGoodDTO, IPaginationDTO } from '../../../dtos';

export interface IKitchenGoodListRs {
    readonly list: IKitchenGoodDTO[];
    readonly pagination: IPaginationDTO;
}
