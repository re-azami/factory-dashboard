import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ImportRoutingModule } from './import.routing';
import { ImportComponent } from './import.component';
import { ImportProgressComponent } from './progress/import-progress.component';

@NgModule({
    declarations: [ImportComponent, ImportProgressComponent],
    imports: [CommonModule, ImportRoutingModule, NgxFormModule, MaterialModule, PageModule],
})
export class ImportModule {}
