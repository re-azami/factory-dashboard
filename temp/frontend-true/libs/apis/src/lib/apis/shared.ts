import { IApiInfo } from '../api.interface';

export type ApiSharedTypes =
    // LOAD
    | 'SharedLoadCargoList'
    | 'SharedLoadCaboratoryConflict'
    // PERSONNEL
    | 'SharedPersonnelMemberList'
    | 'SharedPersonnelMemberInfo';

export const ApiSharedTypesInfo: { [key in ApiSharedTypes]: IApiInfo } = {
    SharedLoadCargoList: { method: 'GET', path: '/shared/load/cargo', params: { status: false, type: false } },
    SharedLoadCaboratoryConflict: { method: 'GET', path: '/shared/load/laboratory-conflict', params: { date: true } },

    SharedPersonnelMemberList: { method: 'GET', path: '/shared/personnel/member' },
    SharedPersonnelMemberInfo: { method: 'GET', path: '/shared/personnel/member/:ID' },
};
