import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { StockComponent } from './stock.component';
import { StockCreateComponent } from './create/stock-create.component';

const routes: Routes = [
    { path: '', component: StockComponent },
    {
        path: 'create',
        data: { header: 'ثبت کالای جدید', userAccess: 'WAREHOUSE_STOCK' },
        canActivate: [UserAccessGuard],
        component: StockCreateComponent,
    },
    // !DEACTIVE STOCK UPDATE
    // {
    //     path: 'update/:stockId',
    //     data: { header: 'ویرایش کالا', userAccess: 'WAREHOUSE_STOCK' },
    //     canActivate: [UserAccessGuard],
    //     resolve: { stock: WarehouseStockResolver },
    //     component: StockUpdateComponent,
    // },
];

@NgModule({ providers: [provideRouter(routes)] })
export class StockRoutingModule {}
