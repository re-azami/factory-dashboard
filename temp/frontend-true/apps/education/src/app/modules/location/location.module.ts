import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { LocationRoutingModule } from './location.routing';
import { LocationComponent } from './location.component';
import { LocationCreateComponent } from './create/location-create.component';
import { LocationUpdateComponent } from './update/location-update.component';

@NgModule({
    declarations: [LocationComponent, LocationCreateComponent, LocationUpdateComponent],
    imports: [CommonModule, LocationRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class LocationModule {}
