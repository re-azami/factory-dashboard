import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBoxModule } from '@webilix/ngx-helper/box';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperParamModule } from '@webilix/ngx-helper/param';

import { MaterialModule } from '@lib/modules';

import { LocationRoutingModule } from './location.routing';
import { LocationComponent } from './location.component';
import { LocationTooltipComponent } from './tooltip/location-tooltip.component';
import { LocationPositionComponent } from './position/location-position.component';
import { LocationSelectComponent } from './select/location-select.component';
import { LocationSiteComponent } from './site/location-site.component';
import { LocationUpdateComponent } from './update/location-update.component';

@NgModule({
    declarations: [
        LocationComponent,
        LocationTooltipComponent,
        LocationPositionComponent,
        LocationSelectComponent,
        LocationSiteComponent,
        LocationUpdateComponent,
    ],
    imports: [
        CommonModule,
        LocationRoutingModule,

        NgxFormModule,
        NgxHelperBoxModule,
        NgxHelperMenuModule,
        NgxHelperParamModule,

        MaterialModule,
    ],
})
export class LocationModule {}
