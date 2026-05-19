import { IApiInfo } from '../api.interface';

export type ApiWarehouseTypes =
    // CATEGORY
    | 'WarehouseCategoryList'
    | 'WarehouseCategoryCreate'
    | 'WarehouseCategoryUpdate'
    | 'WarehouseCategoryDelete'
    | 'WarehouseCategoryJoin'
    | 'WarehouseCategoryDashboard'
    | 'WarehouseCategoryLog'
    // STOCK
    | 'WarehouseStockList'
    | 'WarehouseStockInfo'
    | 'WarehouseStockCreate'
    | 'WarehouseStockUpdate'
    | 'WarehouseStockDelete'
    | 'WarehouseStockTitle'
    | 'WarehouseStockDashboard'
    | 'WarehouseStockLog'
    // EXPORT
    | 'WarehouseExportStock'
    | 'WarehouseExportCategory'
    | 'WarehouseExportCategoryKey'
    | 'WarehouseExportCategoryTitle';

export const ApiWarehouseTypesInfo: { [key in ApiWarehouseTypes]: IApiInfo } = {
    WarehouseCategoryList: { method: 'GET', path: '/warehouse/category' },
    WarehouseCategoryCreate: { method: 'POST', path: '/warehouse/category' },
    WarehouseCategoryUpdate: { method: 'PUT', path: '/warehouse/category/:ID' },
    WarehouseCategoryDelete: { method: 'DELETE', path: '/warehouse/category/:ID' },
    WarehouseCategoryJoin: { method: 'POST', path: '/warehouse/category/join' },
    WarehouseCategoryDashboard: { method: 'GET', path: '/warehouse/category/dashboard' },
    WarehouseCategoryLog: { method: 'GET', path: '/warehouse/category/:ID/log' },

    WarehouseStockList: {
        method: 'GET',
        path: '/warehouse/stock',
        params: { category: false, search: true, query: false, page: false },
    },
    WarehouseStockInfo: { method: 'GET', path: '/warehouse/stock/:ID' },
    WarehouseStockCreate: { method: 'POST', path: '/warehouse/stock' },
    WarehouseStockUpdate: { method: 'PUT', path: '/warehouse/stock/:ID' },
    WarehouseStockDelete: { method: 'DELETE', path: '/warehouse/stock/:ID' },
    WarehouseStockTitle: { method: 'PATCH', path: '/warehouse/stock/:ID/title' },
    WarehouseStockDashboard: { method: 'GET', path: '/warehouse/stock/dashboard' },
    WarehouseStockLog: { method: 'GET', path: '/warehouse/stock/:ID/log' },

    WarehouseExportStock: { method: 'POST', path: '/warehouse/export/stock' },
    WarehouseExportCategory: { method: 'POST', path: '/warehouse/export/category' },
    WarehouseExportCategoryKey: { method: 'POST', path: '/warehouse/export/category/key' },
    WarehouseExportCategoryTitle: { method: 'POST', path: '/warehouse/export/category/title' },
};
