import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { BlaineRoutingModule } from './blaine.routing';
import { BlaineComponent } from './blaine.component';
import { BlaineCreateComponent } from './create/blaine-create.component';
import { BlaineUpdateComponent } from './update/blaine-update.component';

@NgModule({
    declarations: [BlaineComponent, BlaineCreateComponent, BlaineUpdateComponent],
    imports: [CommonModule, BlaineRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class BlaineModule {}
