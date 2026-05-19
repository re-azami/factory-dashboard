import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { PageModule } from '@lib/page';

import { ToolsRoutingModule } from './tools.routing';
import { LaboratoryLoadComponent } from './laboratory-load/laboratory-load.component';

@NgModule({
    declarations: [LaboratoryLoadComponent],
    imports: [CommonModule, ToolsRoutingModule, NgxHelperLoaderModule, PageModule],
})
export class ToolsModule {}
