import { IApiInfo } from './api.interface';

import {
    ApiEducationTypes,
    ApiEducationTypesInfo,
    ApiKitchenTypes,
    ApiKitchenTypesInfo,
    ApiLaboratoryTypes,
    ApiLaboratoryTypesInfo,
    ApiLoadTypes,
    ApiLoadTypesInfo,
    ApiLogTypes,
    ApiLogTypesInfo,
    ApiPersonnelTypes,
    ApiPersonnelTypesInfo,
    ApiSettingTypes,
    ApiSettingTypesInfo,
    ApiSharedTypes,
    ApiSharedTypesInfo,
    ApiSupportTypes,
    ApiSupportTypesInfo,
    ApiTransportTypes,
    ApiTransportTypesInfo,
    ApiUserTypes,
    ApiUserTypesInfo,
    ApiWarehouseTypes,
    ApiWarehouseTypesInfo,
} from './apis';

export type ApiTypes =
    // APPS
    | ApiEducationTypes
    | ApiKitchenTypes
    | ApiLaboratoryTypes
    | ApiLoadTypes
    | ApiPersonnelTypes
    | ApiSupportTypes
    | ApiTransportTypes
    | ApiWarehouseTypes
    // SYSTEM
    | ApiLogTypes
    | ApiSettingTypes
    | ApiSharedTypes
    | ApiUserTypes;

export const ApiTypesInfo: { [key in ApiTypes]: IApiInfo } = {
    // APPS
    ...ApiEducationTypesInfo,
    ...ApiKitchenTypesInfo,
    ...ApiLaboratoryTypesInfo,
    ...ApiLoadTypesInfo,
    ...ApiPersonnelTypesInfo,
    ...ApiSupportTypesInfo,
    ...ApiTransportTypesInfo,
    ...ApiWarehouseTypesInfo,
    // SYSTEM
    ...ApiLogTypesInfo,
    ...ApiSettingTypesInfo,
    ...ApiSharedTypesInfo,
    ...ApiUserTypesInfo,
};
