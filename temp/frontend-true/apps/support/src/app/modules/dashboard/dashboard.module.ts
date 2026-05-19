import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { DashboardRoutingModule } from './dashboard.routing';
import { DashboardComponent } from './dashboard.component';

@NgModule({
    declarations: [DashboardComponent],
    imports: [CommonModule, DashboardRoutingModule, MaterialModule, PageModule],
})
export class DashboardModule {}
