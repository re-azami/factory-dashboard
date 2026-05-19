import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { InstituteRoutingModule } from './institute.routing';
import { InstituteComponent } from './institute.component';
import { InstituteCreateComponent } from './create/institute-create.component';
import { InstituteUpdateComponent } from './update/institute-update.component';

@NgModule({
    declarations: [InstituteComponent, InstituteCreateComponent, InstituteUpdateComponent],
    imports: [CommonModule, InstituteRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class InstituteModule {}
