import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperPlateModule } from '@webilix/ngx-helper/plate';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DraftRoutingModule } from './draft.routing';
import { DraftFinishedComponent } from './finished/draft-finished.component';
import { DraftCanceledComponent } from './canceled/draft-canceled.component';
import { DraftUpdatedComponent } from './updated/draft-updated.component';
import { DraftBulkCancelComponent } from './bulk-cancel/draft-bulk-cancel.component';

import { DraftDailyComponent } from './daily/draft-daily.component';
import { DraftDailySettingComponent } from './daily/setting/draft-daily-setting.component';

import { DraftActiveComponent } from './active/draft-active.component';
import { DraftActiveUpdateCargoComponent } from './active/update/cargo/draft-active-update-cargo.component';
import { DraftActiveUpdatePlateComponent } from './active/update/plate/draft-active-update-plate.component';
import { DraftActiveUpdateTransporterComponent } from './active/update/transporter/draft-active-update-transporter.component';
import { DraftActiveUpdateWeightComponent } from './active/update/weight/draft-active-update-weight.component';

import { DraftInfoComponent } from './info/draft-info.component';
import { DraftInfoUploadComponent } from './info/upload/draft-info-upload.component';

import { DraftUpdateComponent } from './update/draft-update.component';
import { DraftUpdateCargoComponent } from './update/cargo/draft-update-cargo.component';
import { DraftUpdatePlateComponent } from './update/plate/draft-update-plate.component';
import { DraftUpdateTransporterComponent } from './update/transporter/draft-update-transporter.component';
import { DraftUpdateWeightComponent } from './update/weight/draft-update-weight.component';
import { DraftUpdateFinishComponent } from './update/finish/draft-update-finish.component';

@NgModule({
    declarations: [
        DraftFinishedComponent,
        DraftCanceledComponent,
        DraftUpdatedComponent,
        DraftBulkCancelComponent,

        DraftDailyComponent,
        DraftDailySettingComponent,

        DraftActiveComponent,
        DraftActiveUpdateCargoComponent,
        DraftActiveUpdatePlateComponent,
        DraftActiveUpdateTransporterComponent,
        DraftActiveUpdateWeightComponent,

        DraftInfoComponent,
        DraftInfoUploadComponent,

        DraftUpdateComponent,
        DraftUpdateCargoComponent,
        DraftUpdatePlateComponent,
        DraftUpdateTransporterComponent,
        DraftUpdateWeightComponent,
        DraftUpdateFinishComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        DraftRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,
        NgxHelperPlateModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class DraftModule {}
