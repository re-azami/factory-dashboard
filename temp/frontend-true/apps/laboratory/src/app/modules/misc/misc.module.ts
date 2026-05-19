import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { NgxFormModule } from '@webilix/ngx-form';

import { StandardComponent } from '../../components';

import { MiscRoutingModule } from './misc.routing';
import { MiscComponent } from './misc.component';
import { MiscCreateComponent } from './create/misc-create.component';
import { MiscUpdateComponent } from './update/misc-update.component';

@NgModule({
    declarations: [MiscComponent, MiscCreateComponent, MiscUpdateComponent],
    imports: [CommonModule, MiscRoutingModule, NgxFormModule, ListModule, PageModule, StandardComponent],
})
export class MiscModule {}
