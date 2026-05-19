import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';
import { NgxHelperValueModule } from '@webilix/ngx-helper/value';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { AttachmentComponent, DraftMonthlyChartComponent } from '../../components';

import { CargoRoutingModule } from './cargo.routing';
import { CargoComponent } from './cargo.component';
import { CargoInfoComponent } from './info/cargo-info.component';
import { CargoCreateComponent } from './create/cargo-create.component';
import { CargoAttachmentComponent } from './attachment/cargo-attachment.component';
import { CargoStatusComponent } from './status/cargo-status.component';
import { CargoDeactivationComponent } from './deactivation/cargo-deactivation.component';
import { CargoActivationComponent } from './activation/cargo-activation.component';
import { CargoSettingComponent } from './setting/cargo-setting.component';

import { CargoUpdateComponent } from './update/cargo-update.component';
import { CargoUpdatePaymentComponent } from './update/payment/cargo-update-payment.component';

import { CargoTruckComponent } from './truck/cargo-truck.component';
import { CargoTruckCreateComponent } from './truck/create/cargo-truck-create.component';

import { CargoGroupComponent } from './group/cargo-group.component';
import { CargoGroupCreateComponent } from './group/create/cargo-group-create.component';
import { CargoGroupUpdateComponent } from './group/update/cargo-group-update.component';

@NgModule({
    declarations: [
        CargoComponent,
        CargoInfoComponent,
        CargoCreateComponent,
        CargoAttachmentComponent,
        CargoStatusComponent,
        CargoDeactivationComponent,
        CargoActivationComponent,
        CargoSettingComponent,

        CargoUpdateComponent,
        CargoUpdatePaymentComponent,

        CargoTruckComponent,
        CargoTruckCreateComponent,

        CargoGroupComponent,
        CargoGroupCreateComponent,
        CargoGroupUpdateComponent,
    ],
    imports: [
        CommonModule,
        CargoRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperPipeModule,
        NgxHelperValueModule,

        ListModule,
        MaterialModule,
        PageModule,

        AttachmentComponent,
        DraftMonthlyChartComponent,
    ],
})
export class CargoModule {}
