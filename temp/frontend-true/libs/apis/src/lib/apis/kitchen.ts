import { IApiInfo } from '../api.interface';

export type ApiKitchenTypes =
    // ACTIVE
    | 'KitchenActiveGroup'
    | 'KitchenActiveGood'
    | 'KitchenActiveRecipe'
    // GROUP
    | 'KitchenGroupList'
    | 'KitchenGroupCreate'
    | 'KitchenGroupUpdate'
    | 'KitchenGroupDelete'
    // GOOD
    | 'KitchenGoodList'
    | 'KitchenGoodInfo'
    | 'KitchenGoodCreate'
    | 'KitchenGoodUpdate'
    | 'KitchenGoodDelete'
    | 'KitchenGoodStatus'
    | 'KitchenGoodInitial'
    | 'KitchenGoodInventory'
    // INVENTORY
    | 'KitchenInventoryCreate'
    | 'KitchenInventoryUpdate'
    | 'KitchenInventoryDelete'
    // RECIPE
    | 'KitchenRecipeList'
    | 'KitchenRecipeInfo'
    | 'KitchenRecipeCreate'
    | 'KitchenRecipeUpdate'
    | 'KitchenRecipeDelete'
    | 'KitchenRecipeStatus'
    // SERVING
    | 'KitchenServingInfo'
    | 'KitchenServingCreate'
    | 'KitchenServingUpdate'
    | 'KitchenServingDelete'
    | 'KitchenServingCalendar'
    | 'KitchenServingDownload'
    | 'KitchenServingBarcode'
    | 'KitchenServingServe'
    | 'KitchenServingUsage'
    | 'KitchenServingDone'
    | 'KitchenServingLog'
    // SERVING GOOD
    | 'KitchenServingGoodCreate'
    | 'KitchenServingGoodDelete'
    // DASHBOARD
    | 'KitchenDashboardCount'
    | 'KitchenDashboardCalendar'
    | 'KitchenDashboardServing'
    | 'KitchenDashboardInventory';

export const ApiKitchenTypesInfo: { [key in ApiKitchenTypes]: IApiInfo } = {
    KitchenActiveGroup: { method: 'GET', path: '/kitchen/active/group' },
    KitchenActiveGood: { method: 'GET', path: '/kitchen/active/good' },
    KitchenActiveRecipe: { method: 'GET', path: '/kitchen/active/recipe' },

    KitchenGroupList: { method: 'GET', path: '/kitchen/group' },
    KitchenGroupCreate: { method: 'POST', path: '/kitchen/group' },
    KitchenGroupUpdate: { method: 'PUT', path: '/kitchen/group/:ID' },
    KitchenGroupDelete: { method: 'DELETE', path: '/kitchen/group/:ID' },

    KitchenGoodList: {
        method: 'GET',
        path: '/kitchen/good',
        params: { status: false, good: false, group: false, query: false, page: false },
    },
    KitchenGoodInfo: { method: 'GET', path: '/kitchen/good/:ID' },
    KitchenGoodCreate: { method: 'POST', path: '/kitchen/good' },
    KitchenGoodUpdate: { method: 'PUT', path: '/kitchen/good/:ID' },
    KitchenGoodDelete: { method: 'DELETE', path: '/kitchen/good/:ID' },
    KitchenGoodStatus: { method: 'PATCH', path: '/kitchen/good/:ID/status' },
    KitchenGoodInitial: { method: 'PATCH', path: '/kitchen/good/:ID/initial' },
    KitchenGoodInventory: { method: 'GET', path: '/kitchen/good/:ID/inventory', params: { page: false } },

    KitchenInventoryCreate: { method: 'POST', path: '/kitchen/inventory' },
    KitchenInventoryUpdate: { method: 'PUT', path: '/kitchen/inventory/:ID' },
    KitchenInventoryDelete: { method: 'DELETE', path: '/kitchen/inventory/:ID' },

    KitchenRecipeList: {
        method: 'GET',
        path: '/kitchen/recipe',
        params: { status: false, meal: false, query: false, page: false },
    },
    KitchenRecipeInfo: { method: 'GET', path: '/kitchen/recipe/:ID' },
    KitchenRecipeCreate: { method: 'POST', path: '/kitchen/recipe' },
    KitchenRecipeUpdate: { method: 'PUT', path: '/kitchen/recipe/:ID' },
    KitchenRecipeDelete: { method: 'DELETE', path: '/kitchen/recipe/:ID' },
    KitchenRecipeStatus: { method: 'PATCH', path: '/kitchen/recipe/:ID/status' },

    KitchenServingInfo: { method: 'GET', path: '/kitchen/serving/:ID' },
    KitchenServingCreate: { method: 'POST', path: '/kitchen/serving' },
    KitchenServingUpdate: { method: 'PUT', path: '/kitchen/serving/:ID' },
    KitchenServingDelete: { method: 'DELETE', path: '/kitchen/serving/:ID' },
    KitchenServingCalendar: { method: 'GET', path: '/kitchen/serving/calendar', params: { from: true, to: true } },
    KitchenServingDownload: { method: 'GET', path: '/kitchen/serving/download', params: { serving: true } },
    KitchenServingBarcode: { method: 'GET', path: '/kitchen/serving/barcode', params: { jalali: true, meal: true } },
    KitchenServingServe: { method: 'PATCH', path: '/kitchen/serving/:ID/serve' },
    KitchenServingUsage: { method: 'PATCH', path: '/kitchen/serving/:ID/usage' },
    KitchenServingDone: { method: 'PATCH', path: '/kitchen/serving/:ID/done' },
    KitchenServingLog: { method: 'GET', path: '/kitchen/serving/:ID/log' },

    KitchenServingGoodCreate: { method: 'POST', path: '/kitchen/serving/:SERVINGID/good' },
    KitchenServingGoodDelete: { method: 'DELETE', path: '/kitchen/serving/:SERVINGID/good/:ID' },

    KitchenDashboardCount: { method: 'GET', path: '/kitchen/dashboard/count', params: { period: true } },
    KitchenDashboardCalendar: { method: 'GET', path: '/kitchen/dashboard/calendar', params: { from: true, to: true } },
    KitchenDashboardServing: { method: 'GET', path: '/kitchen/dashboard/serving' },
    KitchenDashboardInventory: { method: 'GET', path: '/kitchen/dashboard/inventory' },
};
