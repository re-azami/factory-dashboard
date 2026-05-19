import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { AdminRoutingModule } from './admin.routing';
import { AdminComponent } from './admin.component';
import { AdminUpdateComponent } from './update/admin-update.component';

@NgModule({
    declarations: [AdminComponent, AdminUpdateComponent],
    imports: [CommonModule, AdminRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class AdminModule {}
