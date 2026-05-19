import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ServiceRoutingModule } from './service.routing';
import { ServiceComponent } from './service.component';

@NgModule({
    declarations: [ServiceComponent],
    imports: [CommonModule, ServiceRoutingModule, ChartModule, PageModule],
})
export class ServiceModule {}
