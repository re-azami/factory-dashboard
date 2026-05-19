import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TooltipCenterComponent, TooltipLocationComponent } from '../../components';

import { StationRoutingModule } from './station.routing';
import { StationComponent } from './station.component';
import { StationCreateComponent } from './create/station-create.component';
import { StationUpdateComponent } from './update/station-update.component';
import { StationCopyComponent } from './copy/station-copy.component';
import { StationCompareComponent } from './compare/station-compare.component';

import { StationMapCreateComponent } from './map/create/station-map-create.component';
import { StationMapCreateOptionComponent } from './map/create/option/station-map-create-option.component';
import { StationMapUpdateComponent } from './map/update/station-map-update.component';
import { StationMapUpdateMoveComponent } from './map/update/move/station-map-update-move.component';
import { StationMapUpdateCenterComponent } from './map/update/center/station-map-update-center.component';

@NgModule({
    declarations: [
        StationComponent,
        StationCreateComponent,
        StationUpdateComponent,
        StationCopyComponent,
        StationCompareComponent,

        StationMapCreateComponent,
        StationMapCreateOptionComponent,
        StationMapUpdateComponent,
        StationMapUpdateMoveComponent,
        StationMapUpdateCenterComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        StationRoutingModule,

        NgxFormModule,
        NgxHelperLoaderModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,

        TooltipCenterComponent,
        TooltipLocationComponent,
    ],
})
export class StationModule {}
