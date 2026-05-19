import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { CheckoutRoutingModule } from './checkout.routing';
import { CheckoutComponent } from './checkout.component';
import { CheckoutCreateComponent } from './create/checkout-create.component';
import { CheckoutPaymentComponent } from './payment/checkout-payment.component';
import { CheckoutDownloadComponent } from './download/checkout-download.component';

@NgModule({
    declarations: [CheckoutComponent, CheckoutCreateComponent, CheckoutPaymentComponent, CheckoutDownloadComponent],
    imports: [
        CommonModule,
        CheckoutRoutingModule,
        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperPipeModule,
        ListModule,
        PageModule,
    ],
})
export class CheckoutModule {}
