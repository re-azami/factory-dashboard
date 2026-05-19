import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPaginationModule } from '@webilix/ngx-helper/pagination';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { MaterialModule } from '@lib/modules';

import { ListComponent } from './list.component';
import { ListCardComponent } from './card/list-card.component';
import { ListGridComponent } from './grid/list-grid.component';
import { ListValueComponent } from './value/list-value.component';

import { ListService } from './list.service';

@NgModule({
    declarations: [ListComponent, ListCardComponent, ListGridComponent, ListValueComponent],
    imports: [
        CommonModule,

        NgxHelperLoaderModule,
        NgxHelperMenuModule,
        NgxHelperPaginationModule,
        NgxHelperPipeModule,
        NgxHelperPlateModule,

        MaterialModule,
    ],
    providers: [ListService],
    exports: [ListComponent],
})
export class ListModule {}
