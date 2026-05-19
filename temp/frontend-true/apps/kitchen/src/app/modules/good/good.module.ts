import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperValueModule } from '@webilix/ngx-helper/value';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { GoodRoutingModule } from './good.routing';
import { GoodComponent } from './good.component';
import { GoodCreateComponent } from './create/good-create.component';
import { GoodUpdateComponent } from './update/good-update.component';
import { GoodInventoryComponent } from './inventory/good-inventory.component';

@NgModule({
    declarations: [GoodComponent, GoodCreateComponent, GoodUpdateComponent, GoodInventoryComponent],
    imports: [
        CommonModule,
        GoodRoutingModule,

        NgxFormModule,
        NgxHelperPipeModule,
        NgxHelperValueModule,

        ListModule,
        PageModule,
    ],
})
export class GoodModule {}
