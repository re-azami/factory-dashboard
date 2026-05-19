import { IPersonnelMemberLocationDTO } from '@lib/apis';

export interface ILocation {
    index: number;
    latitude: number;
    longitude: number;
    members: IPersonnelMemberLocationDTO[];
}
