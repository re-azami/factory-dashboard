import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { PageModule } from '@lib/page';

import { ExportRoutingModule } from './export.routing';
import { ExportComponent } from './export.component';

@NgModule({
    declarations: [ExportComponent],
    imports: [CommonModule, ExportRoutingModule, NgxFormModule, PageModule],
})
export class ExportModule {}
