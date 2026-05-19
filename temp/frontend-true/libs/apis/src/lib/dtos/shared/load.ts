import { ILoadCargoDTO } from '../load/cargo';

export interface ISharedLoadCargoDTO
    extends Pick<ILoadCargoDTO, 'id' | 'type' | 'title' | 'party' | 'shipment' | 'status'> {}
