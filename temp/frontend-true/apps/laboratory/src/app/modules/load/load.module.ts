import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { StandardComponent } from '../../components';

import { LoadRoutingModule } from './load.routing';
import { LoadComponent } from './load.component';
import { LoadUpdateComponent } from './update/load-update.component';

@NgModule({
    declarations: [LoadComponent, LoadUpdateComponent],
    imports: [CommonModule, LoadRoutingModule, NgxFormModule, ListModule, PageModule, StandardComponent],
})
export class LoadModule {}
