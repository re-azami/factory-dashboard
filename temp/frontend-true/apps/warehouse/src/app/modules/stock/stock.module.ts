import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { FilterComponent, ParentsComponent } from '../../components';

import { StockRoutingModule } from './stock.routing';
import { StockComponent } from './stock.component';
import { StockCreateComponent } from './create/stock-create.component';
import { StockJoinComponent } from './join/stock-join.component';
import { StockTitleComponent } from './title/stock-title.component';

@NgModule({
    declarations: [StockComponent, StockCreateComponent, StockJoinComponent, StockTitleComponent],
    imports: [CommonModule, StockRoutingModule, NgxFormModule, ListModule, PageModule, FilterComponent, ParentsComponent],
})
export class StockModule {}
