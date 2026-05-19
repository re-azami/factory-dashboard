import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { StandardComponent } from '../../components';

import { CrusherRoutingModule } from './crusher.routing';
import { CrusherComponent } from './crusher.component';
import { CrusherCreateComponent } from './create/crusher-create.component';
import { CrusherUpdateComponent } from './update/crusher-update.component';
import { CrusherInfoComponent } from './info/crusher-info.component';

@NgModule({
    declarations: [CrusherComponent, CrusherCreateComponent, CrusherInfoComponent, CrusherUpdateComponent],
    imports: [
        CommonModule,
        CrusherRoutingModule,

        NgxFormModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        ListModule,
        PageModule,

        StandardComponent,
    ],
})
export class CrusherModule {}
