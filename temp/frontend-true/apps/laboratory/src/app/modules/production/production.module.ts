import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { ProductionRoutingModule } from './production.routing';

import { ProductionCrusherComponent } from './crusher/production-crusher.component';
import { ProductionCrusherInfoComponent } from './crusher/info/production-crusher-info.component';
import { ProductionCrusherCreateComponent } from './crusher/create/production-crusher-create.component';
import { ProductionCrusherUpdateComponent } from './crusher/update/production-crusher-update.component';

import { ProductionKhatkaComponent } from './khatka/production-khatka.component';
import { ProductionKhatkaInfoComponent } from './khatka/info/production-khatka-info.component';
import { ProductionKhatkaCreateComponent } from './khatka/create/production-khatka-create.component';
import { ProductionKhatkaUpdateComponent } from './khatka/update/production-khatka-update.component';

@NgModule({
    declarations: [
        ProductionCrusherComponent,
        ProductionCrusherInfoComponent,
        ProductionCrusherCreateComponent,
        ProductionCrusherUpdateComponent,

        ProductionKhatkaComponent,
        ProductionKhatkaInfoComponent,
        ProductionKhatkaCreateComponent,
        ProductionKhatkaUpdateComponent,
    ],
    imports: [CommonModule, ProductionRoutingModule, NgxFormModule, NgxHelperPipeModule, ListModule, PageModule],
})
export class ProductionModule {}
