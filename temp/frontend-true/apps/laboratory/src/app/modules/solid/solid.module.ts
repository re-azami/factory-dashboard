import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { SolidRoutingModule } from './solid.routing';
import { SolidComponent } from './solid.component';
import { SolidCreateComponent } from './create/solid-create.component';
import { SolidUpdateComponent } from './update/solid-update.component';
import { SolidInfoComponent } from './info/solid-info.component';

@NgModule({
    declarations: [SolidComponent, SolidCreateComponent, SolidInfoComponent, SolidUpdateComponent],
    imports: [CommonModule, SolidRoutingModule, NgxFormModule, NgxHelperPipeModule, ListModule, PageModule],
})
export class SolidModule {}
