import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { StandardComponent } from '../../components';

import { KhatkaRoutingModule } from './khatka.routing';
import { KhatkaComponent } from './khatka.component';
import { KhatkaCreateComponent } from './create/khatka-create.component';
import { KhatkaUpdateComponent } from './update/khatka-update.component';
import { KhatkaInfoComponent } from './info/khatka-info.component';

@NgModule({
    declarations: [KhatkaComponent, KhatkaCreateComponent, KhatkaUpdateComponent, KhatkaInfoComponent],
    imports: [
        CommonModule,
        KhatkaRoutingModule,

        NgxFormModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        ListModule,
        PageModule,

        StandardComponent,
    ],
})
export class KhatkaModule {}
