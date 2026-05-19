import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { GroupRoutingModule } from './group.routing';
import { GroupComponent } from './group.component';
import { GroupCreateComponent } from './create/group-create.component';
import { GroupUpdateComponent } from './update/group-update.component';
import { GroupOrderComponent } from './order/group-order.component';

@NgModule({
    declarations: [GroupComponent, GroupCreateComponent, GroupUpdateComponent, GroupOrderComponent],
    imports: [CommonModule, GroupRoutingModule, NgxFormModule, ListModule, MaterialModule, PageModule],
})
export class GroupModule {}
