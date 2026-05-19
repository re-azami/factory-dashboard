import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { StandardComponent } from '../../components';

import { SupplementaryRoutingModule } from './supplementary.routing';
import { SupplementaryComponent } from './supplementary.component';
import { SupplementaryCreateComponent } from './create/supplementary-create.component';
import { SupplementaryUpdateComponent } from './update/supplementary-update.component';
import { SupplementaryInfoComponent } from './info/supplementary-info.component';

import { SupplementaryTestCreateComponent } from './test/create/supplementary-test-create.component';
import { SupplementaryTestUpdateComponent } from './test/update/supplementary-test-update.component';

@NgModule({
    declarations: [
        SupplementaryComponent,
        SupplementaryCreateComponent,
        SupplementaryUpdateComponent,
        SupplementaryInfoComponent,

        SupplementaryTestCreateComponent,
        SupplementaryTestUpdateComponent,
    ],
    imports: [
        CommonModule,
        SupplementaryRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,

        ListModule,
        MaterialModule,
        PageModule,
        StandardComponent,
    ],
})
export class SupplementaryModule {}
