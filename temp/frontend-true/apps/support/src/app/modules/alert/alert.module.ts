import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { AlertRoutingModule } from './alert.routing';
import { AlertComponent } from './alert.component';
import { AlertRecipientComponent } from './recipient/alert-recipient.component';

@NgModule({
    declarations: [AlertComponent, AlertRecipientComponent],
    imports: [CommonModule, AlertRoutingModule, NgxHelperPipeModule, ListModule, PageModule],
})
export class AlertModule {}
