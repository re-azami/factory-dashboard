import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { StandardComponent } from '../../components';

import { DavisRoutingModule } from './davis.routing';
import { DavisComponent } from './davis.component';
import { DavisCreateComponent } from './create/davis-create.component';
import { DavisUpdateComponent } from './update/davis-update.component';

@NgModule({
    declarations: [DavisComponent, DavisCreateComponent, DavisUpdateComponent],
    imports: [CommonModule, DavisRoutingModule, NgxFormModule, ListModule, PageModule, StandardComponent],
})
export class DavisModule {}
