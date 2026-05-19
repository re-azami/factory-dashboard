import { IKitchenRecipeDTO, IPaginationDTO } from '../../../dtos';

export interface IKitchenRecipeListRs {
    readonly list: IKitchenRecipeDTO[];
    readonly pagination: IPaginationDTO;
}
