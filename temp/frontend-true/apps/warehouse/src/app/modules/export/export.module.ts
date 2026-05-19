import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ParentsComponent } from '../../components';

import { ExportRoutingModule } from './export.routing';
import { ExportComponent } from './export.component';

@NgModule({
    declarations: [ExportComponent],
    imports: [CommonModule, ExportRoutingModule, ListModule, MaterialModule, PageModule, ParentsComponent],
})
export class ExportModule {}
